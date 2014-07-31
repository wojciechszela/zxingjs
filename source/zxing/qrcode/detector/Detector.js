define([
    'dejavu/Class',
    'zxing/DecodeHintType',
    'zxing/ResultPoint',
    'zxing/common/DetectorResult',
    'zxing/common/GridSampler',
    'zxing/common/PerspectiveTransform',
    'zxing/common/detector/MathUtils',
    'zxing/qrcode/detector/AlignmentPatternFinder',
    'zxing/qrcode/detector/FinderPatternFinder',
    'zxing/qrcode/decoder/Version',
    'zxing/exception/NotFoundException',
    'mout/lang/isObject',
    'mout/object/hasOwn'
], function (Class, DecodeHintType, ResultPoint, DetectorResult, GridSampler, PerspectiveTransform, MathUtils, AlignmentPatternFinder, FinderPatternFinder, Version, NotFoundException, isObject, hasOwn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Detector = Class.declare({
        $name : 'zxing/qrcode/detector/Detector',

        __image : null,

        __resultPointCallback : null,

        initialize : function (image) {
            this.__image = image;
        },

        _getImage : function () {
            return this.__image;
        },

        _getResultPointCallback : function () {
            return this.__resultPointCallback;
        },

        detect : function (hints) {
            this.__resultPointCallback = isObject(hints) && hasOwn(hints, DecodeHintType.$static.NEED_RESULT_POINT_CALLBACK) ? hints[DecodeHintType.$static.NEED_RESULT_POINT_CALLBACK] : null;

            var finder = new FinderPatternFinder(this.__image, this.__resultPointCallback);
            var info = finder.find(hints);

            return this._processFinderPatternInfo(info);
        },

        _processFinderPatternInfo : function (info) {
            var topLeft    = info.getTopLeft();
            var topRight   = info.getTopRight();
            var bottomLeft = info.getBottomLeft();

            var moduleSize = this._calculateModuleSize(topLeft, topRight, bottomLeft);
            if (moduleSize < 1.0) {
                throw new NotFoundException();
            }

            var dimension = this.$static.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
            var provisionalVersion = Version.$static.getProvisionalVersionForDimension(dimension);
            var modulesBetweenFPCenters = provisionalVersion.getDimensionForVersion() - 7;

            var alignmentPattern = null;

            if (provisionalVersion.getAlignmentPatternCenters().length > 0) {
                var bottomRightX = topRight.getX() - topLeft.getX() + bottomLeft.getX();
                var bottomRightY = topRight.getY() - topLeft.getY() + bottomLeft.getY();

                var correctionToTopLeft = 1.0 - 3.0 / modulesBetweenFPCenters;
                var estAlignmentX = topLeft.getX() + correctionToTopLeft * (bottomRightX - topLeft.getX());
                var estAlignmentY = topLeft.getY() + correctionToTopLeft * (bottomRightY - topLeft.getY());

                for (var i = 4; i <= 16; i = i << 1) {
                    try {
                        alignmentPattern = this._findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
                        break;
                    } catch (e) {
                        // try next round
                    }
                }
            }

            var transform = this.$static.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);

            var bits = this.$static.sampleGrid(this.__image, transform, dimension);

            var points;
            if (alignmentPattern == null) {
                points = [bottomLeft, topLeft, topRight];
            } else {
                points = [bottomLeft, topLeft, topRight, alignmentPattern];
            }
            return new DetectorResult(bits, points);
        },

        $statics : {
            createTransform : function (topLeft, topRight, bottomLeft, alignmentPattern, dimension) {
                var dimMinusThree = dimension - 3.5;
                var bottomRightX;
                var bottomRightY;
                var sourceBottomRightX;
                var sourceBottomRightY;
                if (alignmentPattern != null) {
                    bottomRightX = alignmentPattern.getX();
                    bottomRightY = alignmentPattern.getY();
                    sourceBottomRightX = dimMinusThree - 3.0;
                    sourceBottomRightY = sourceBottomRightX;
                } else {
                    bottomRightX = (topRight.getX() - topLeft.getX()) + bottomLeft.getX();
                    bottomRightY = (topRight.getY() - topLeft.getY()) + bottomLeft.getY();
                    sourceBottomRightX = dimMinusThree;
                    sourceBottomRightY = dimMinusThree;
                }
                return PerspectiveTransform.$static.quadrilateralToQuadrilateral(
                    3.5,
                    3.5,
                    dimMinusThree,
                    3.5,
                    sourceBottomRightX,
                    sourceBottomRightY,
                    3.5,
                    dimMinusThree,
                    topLeft.getX(),
                    topLeft.getY(),
                    topRight.getX(),
                    topRight.getY(),
                    bottomRightX,
                    bottomRightY,
                    bottomLeft.getX(),
                    bottomLeft.getY()
                );
            },

            sampleGrid : function (image, transform, dimension) {
                var sampler = GridSampler.$static.getInstance();
                return sampler.sampleGrid(image, dimension, dimension, transform);
            },

            computeDimension : function (topLeft, topRight, bottomLeft, moduleSize) {
                var tltrCentersDimension = MathUtils.round(ResultPoint.$static.distance(topLeft, topRight) / moduleSize);
                var tlblCentersDimension = MathUtils.round(ResultPoint.$static.distance(topLeft, bottomLeft) / moduleSize);
                var dimension = Math.floor(((tltrCentersDimension + tlblCentersDimension) / 2) + 7);

                switch (dimension & 0x03) {
                    case 0:
                        dimension++;
                        break;
                    case 2:
                        dimension--;
                        break;
                    case 3:
                        throw new NotFoundException();
                }

                return dimension;
            }
        },

        _calculateModuleSize : function (topLeft, topRight, bottomLeft) {
            return (this.__calculateModuleSizeOneWay(topLeft, topRight) + this.__calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
        },

        __calculateModuleSizeOneWay : function (pattern, otherPattern) {
            var moduleSizeEst1 = this.__sizeOfBlackWhiteBlackRunBothWays(
                Math.floor(pattern.getX()),
                Math.floor(pattern.getY()),
                Math.floor(otherPattern.getX()),
                Math.floor(otherPattern.getY())
            );
            var moduleSizeEst2 = this.__sizeOfBlackWhiteBlackRunBothWays(
                Math.floor(otherPattern.getX()),
                Math.floor(otherPattern.getY()),
                Math.floor(pattern.getX()),
                Math.floor(pattern.getY())
            );

            if (isNaN(moduleSizeEst1)) {
                return moduleSizeEst2 / 7.0;
            }

            if (isNaN(moduleSizeEst2)) {
                return moduleSizeEst1 / 7.0;
            }

            return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
        },

        __sizeOfBlackWhiteBlackRunBothWays : function (fromX, fromY, toX, toY) {
            var result = this.__sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

            var scale = 1.0;
            var otherToX = fromX - (toX - fromX);
            if (otherToX < 0) {
                scale = fromX / (fromX - otherToX);
                otherToX =  0;
            } else if (otherToX >= this.__image.getWidth()) {
                scale = (this.__image.getWidth() - 1 - fromX) / (otherToX - fromX);
                otherToX = this.__image.getWidth() - 1;
            }
            var otherToY = Math.floor((fromY - (toY - fromY) * scale));

            scale = 1.0;
            if (otherToY < 0) {
                scale = fromY / (fromY - otherToY);
                otherToY = 0;
            } else if (otherToY >= this.__image.getHeight()) {
                scale = (this.__image.getHeight() - 1 - fromY) / (otherToY - fromY);
                otherToY = this.__image.getHeight() - 1;
            }
            otherToX = Math.floor((fromX + (otherToX - fromX) * scale));

            result += this.__sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);

            return result - 1.0;
        },

        __sizeOfBlackWhiteBlackRun : function (fromX, fromY, toX, toY) {
            var steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
            if (steep) {
                var temp = fromX;
                fromX = fromY;
                fromY = temp;
                temp = toX;
                toX = toY;
                toY = temp;
            }

            var dx = Math.abs(toX - fromX);
            var dy = Math.abs(toY - fromY);
            var error = -dx / 2;
            var xstep = fromX < toX ? 1 : -1;
            var ystep = fromY < toY ? 1 : -1;

            var state = 0;
            var xLimit = toX + xstep;
            for (var x = fromX, y = fromY; x != xLimit; x += xstep) {
                var realX = steep ? y : x;
                var realY = steep ? x : y;

                if ((state == 1) == this.__image.get(realX, realY)) {
                    if (state == 2) {
                        return MathUtils.distance(x, y, fromX, fromY);
                    }
                    state++;
                }

                error += dy;
                if (error > 0) {
                    if (y == toY) {
                        break;
                    }
                    y += ystep;
                    error -= dx;
                }
            }

            if (state == 2) {
                return MathUtils.distance(toX + xstep, toY, fromX, fromY);
            }

            return NaN;
        },

        _findAlignmentInRegion : function (overallEstModuleSize, estAlignmentX, estAlignmentY, allowanceFactor) {
            var allowance = (allowanceFactor * overallEstModuleSize);
            var alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
            var alignmentAreaRightX = Math.min(this.__image.getWidth() - 1, estAlignmentX + allowance);
            if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
                throw new NotFoundException();
            }

            var alignmentAreaTopY = Math.max(0, eestAlignmentY - allowance);
            var alignmentAreaBottomY = Math.min(this.__image.getHeight() - 1, estAlignmentY + allowance);
            if (alignmentAreaBottomY - alignmentAreaTopY < overallEstModuleSize * 3) {
                throw new NotFoundException();
            }

            var alignmentFinder = new AlignmentPatternFinder(
                this.__image,
                alignmentAreaLeftX,
                alignmentAreaTopY,
                alignmentAreaRightX - alignmentAreaLeftX,
                alignmentAreaBottomY - alignmentAreaTopY,
                overallEstModuleSize,
                this.__resultPontCallback
            );
            return alignmentFinder.find();
        }
    });

    return Detector;
});