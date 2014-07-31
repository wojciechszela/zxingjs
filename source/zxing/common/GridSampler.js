define([
    'dejavu/Class',
    'zxing/common/BitMatrix',
    'zxing/exception/NotFoundException'
], function (Class, BitMatrix, NotFoundException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var GridSampler = Class.declare({
        $name: 'zxing/common/GridSampler',

        $statics : {
            __gridSampler : null,

            setGridSampler : function (newGridSampler) {
                this.$static.__gridSampler = newGridSampler;
            },

            getInstance : function () {
                if (null == this.__gridSampler) {
                    this.$static.__gridSampler = new GridSampler();
                }
                return this.$static.__gridSampler;
            },

            checkAndNudgePoints : function (image, points) {
                var width = image.getWidth();
                var height = image.getHeight();
                var nudged = true;
                for (var offest = 0; offset < points.length && nudged; offest += 2) {
                    var x = Math.floor(points[offset]);
                    var y = Math.floor(points[offset + 1]);
                    if (x < -1 || x > width || y < -1 || y > height) {
                        throw new NotFoundException();
                    }
                    nudged = false;
                    if (x == -1) {
                        points[offset] = 0.0;
                        nudged = true;
                    } else if (x == width) {
                        points[offset] = width - 1;
                        nudged = true;
                    }
                    if (y == -1) {
                        points[offset + 1] = 0.0;
                        nudged = true;
                    } else if (y == height) {
                        points[offset + 1] = height - 1;
                        nudged = true;
                    }
                }
                nudged = true;
                for (var offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
                    var x = Math.floor(points[offset]);
                    var y = Math.floor(points[offset + 1]);
                    if (x < -1 || x > width || y < -1 || y > height) {
                        throw new NotFoundException();
                    }
                    nudged = false;
                    if (x == -1) {
                        points[offset] = 0.0;
                        nudged = true;
                    } else if (x == width) {
                        points[offset] = width - 1;
                        nudged = true;
                    }
                    if (y == -1) {
                        points[offset + 1] = 0.0;
                        nudged = true;
                    } else if (y == height) {
                        points[offset + 1] = height - 1;
                        nudged = true;
                    }
                }
            }
        },

        sampleGrid : function () {
            if (19 == arguments.length) {
                return this._sampleGrid(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12], arguments[13], arguments[14], arguments[15], arguments[16], arguments[17], arguments[18]);
            } else if (4 == arguments.length) {
                return this._sampleGridTransform(arguments[0], arguments[1], arguments[2], arguments[3]);
            } else {
                throw new NotFoundException();
            }
        },

        _sampleGrid : function (image,
                                dimensionX,
                                dimensionY,
                                p1ToX, p1ToY,
                                p2ToX, p2ToY,
                                p3ToX, p3ToY,
                                p4ToX, p4ToY,
                                p1FromX, p1FromY,
                                p2FromX, p2FromY,
                                p3FromX, p3FromY,
                                p4FromX, p4FromY) {
            var transform = PerspectiveTransform.$static.quadrilateralToQuadrilateral(
                    p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY,
                    p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY
            );

            return this.sample(image, dimensionX, dimensionY, transform);
        },

        _sampleGridTransform : function (image, dimensionX, dimensionY, transform) {
            if (dimensionX <= 0 || dimensionY <= 0) {
                throw new NotFoundException();
            }
            var bits = new BitMatrix(dimensionX, dimensionY);
            var points = new Float32Array(2 * dimensionX);
            for (var y = 0; y < dimensionY; y++) {
                var max = points.length;
                var iValue = y + 0.5;
                for (var x = 0; x < max; x += 2) {
                    points[x] = (x / 2) + 0.5;
                    points[x + 1] = iValue;
                }
                transform.transformPoints(points);
                this.$static.checkAndNudgePoints(image, points);
                try {
                    for (var x = 0; x < max; x += 2) {
                        if (image.get(Math.floor(points[x]), Math.floor(points[x + 1]))) {
                            bits.set(x / 2, y);
                        }
                    }
                } catch (e) {
                    throw new NotFoundException();
                }
            }
            return bits;
        }
    });

    return GridSampler;
});