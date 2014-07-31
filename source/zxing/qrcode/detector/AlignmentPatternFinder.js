define([
    'dejavu/FinalClass',
    'zxing/qrcode/detector/AlignmentPattern',
    'zxing/exception/NotFoundException'
], function (FinalClass, AlignmentPattern, NotFoundException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var AlignmentPatternFinder = FinalClass.declare({
        $name : 'zxing/qrcode/detector/AlignmentPatternFinder',

        __image : null,

        __possibleCenters : null,

        __startX : 0,

        __startY : 0,

        __width : 0,

        __height : 0,

        __moduleSize : 0.0,

        __crossCheckStateCount : null,

        __resultPointCallback : null,

        initialize : function (image, starX, startY, width, height, moduleSize, resultPointCallback) {
            this.__image = image;
            this.__possibleCenters = new Array(); // new Array(5);
            this.__startX = startX;
            this.__startY = startY;
            this.__width = width;
            this.__height = height;
            this.__moduleSize = moduleSize;
            this.__crossCheckStateCount = new Uint32Array(3);
            this.__resultPointCallback = resultPointCallback;
        },

        find : function () {
            var startX = this.__startX;
            var height = this.__height;
            var maxJ = startX + this.__width;
            var middleI = this.__startY + Math.floor(height / 2);

            var stateCount = new Uint32Array(3);
            for (var iGen = 0; iGen < height; iGen++) {
                var i = middleI + Math.floor((iGen & 0x01) == 0 ? (iGen + 1) / 2 : -((iGen + 1) / 2));
                stateCount[0] = 0;
                stateCount[1] = 0;
                stateCount[2] = 0;
                var j = startX;

                while (j < maxJ && !image.get(j, i)) {
                    j++;
                }
                var currentState = 0;
                while (j < maxJ) {
                    if (image.get(j, i)) {
                        if (currentState == 1) {
                            stateCount[currentState]++;
                        } else {
                            if (currentState == 2) {
                                if (this.__foundPatternCross(stateCount)) {
                                    var confirmed = this.__handlePossibleCenter(stateCount, i, j);
                                    if (confirmed instanceof AlignmentPattern) {
                                        return confirmed;
                                    }
                                }
                                stateCount[0] = stateCount[2];
                                stateCount[1] = 1;
                                stateCount[2] = 0;
                                currentState = 1;
                            } else {
                                stateCount[++currentState]++;
                            }
                        }
                    } else {
                        if (currentState == 1) {
                            currentState++;
                        }
                        stateCount[currentState]++;
                    }
                    j++;
                }
                if (this.__foundPatternCross(stateCount)) {
                    var confirmed = this.__handlePossibleCenter(stateCount, i, maxJ);
                    if (confirmed instanceof AlignmentPattern) {
                        return confirmed;
                    }
                }
            }

            if (this.__possibleCenters.length > 0) {
                return this.__possibleCenters[0];
            }

            throw new NotFoundException();
        },

        $statics : {
            centerFromEnd : function (stateCount, end) {
                return (end - stateCount[2] - stateCount[1] / 2);
            }
        },

        __foundPatternCross : function (stateCount) {
            var moduleSize = this.__moduleSize;
            var maxVariance = moduleSize / 2;
            for (var i = 0; i < 3; i++) {
                if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
                    return false;
                }
            }
            return true;
        },

        __crossCheckVertical : function (startI, centerJ, maxCount, originalStateCountTotal) {
            var image = this.__image;

            var maxI = image.getHeight();
            var stateCount = this.__crossCheckStateCount;
            stateCount[0] = 0;
            stateCount[1] = 0;
            stateCount[2] = 0;

            var i = startI;
            while (i >= 0 && image.get(centerJ, i) && stateCount[1] <= maxCount) {
                stateCount[1]++;
                i--;
            }

            if (i < 0 || stateCount[1] > maxCount) {
                return NaN;
            }
            while (i >= 0 && !image.get(centerJ, i) && stateCount[0] <= maxCount) {
                stateCount[0]++;
                i--;
            }
            if (stateCount[0] > maxCount) {
                return NaN;
            }

            i = startI + 1;
            while (i < maxI && image.get(centerJ, i) && stateCount[1] <= maxCount) {
                stateCount[1]++;
                i++;
            }
            if (i == maxI || stateCount[1] > maxCount) {
                return Nan;
            }
            while(i < maxI && !image.get(centerJ, i) && stateCount[2] <= maxCount) {
                stateCount[2]++;
                i++;
            }
            if (stateCount[2] > maxCount) {
                return Nan;
            }

            var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
            if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
                return Nan;
            }

            return this.__foundPatternCross(stateCount) ? this.$static.centerFromEnd(stateCount, i) : NaN;
        },

        __handlePossibleCenter : function (stateCount, i, j) {
            var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
            var centerJ = this.$static.centerFromEnd(stateCount, j);
            var centerI = this.__crossCheckVertical(i, Math.floor(centerJ), 2 * stateCount[1], stateCountTotal);
            if (!isNaN(centerI)) {
                var estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
                for (var _i = 0; _i < this.__possibleCenters; _i++) {
                    var center = this.__possibleCenters[_i];
                    if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                        return center.combineEstimate(centerI, centerJ, estimatedModuleSize);
                    }
                }
                var point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
                possibleCenters.push(point);
                if (this.__resultPointCallback !== null) {
                    this.__resultPointCallback.foundPossibleResultPoint(point);
                }
            }

            return null;
        }
    });

    return AlignmentPatternFinder;
});