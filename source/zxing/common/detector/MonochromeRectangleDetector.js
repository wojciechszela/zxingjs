define([
    'dejavu/FinalClass',
    'zxing/ResultPoint'
], function (FinalClass, ResultPoint) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var MonochromeRectangleDetector = FinalClass.declare({
        $name: 'zxing/common/detector/MonochromeRectangleDetector',

        $finals : {
            $statics : {
                MAX_MODULES : 32
            },

            __image : null
        },

        initialize : function (image) {
            this.__image = image;
        },

        detect : function () {
            var height = this.__image.getHeight();
            var width = this.__image.getWidth();
            var halfHeight = Math.floor(height / 2);
            var halfWidth = Math.floor(width / 2);
            var deltaY = Math.floor(Math.max(1, height / (this.$static.MAX_MODULES * 8)));
            var deltaX = Math.floor(Math.max(1, width / (this.$static.MAX_MODULES * 8)));

            var top = 0;
            var bottom = height;
            var left = 0;
            var right = width;

            var pointA = this.__findCornerFromCenter(halfWidth, 0, left, right, halfHeight, -deltaY, top, bottom, Math.floor(halfWidth / 2));
            top = Math.floor(pointA.getY() - 1);
            var pointB = this.__findCornerFromCenter(halfWidth, -deltaX, left, right, halfHeight, 0, top, bottom, Math.floor(halfHeight / 2));
            left = Math.floor(pointB.getX() - 1);
            var pointC = this.__findCornerFromCenter(halfWidth, deltaX, left, right, halfHeight, 0, top, bottom, Math.floor(halfHeight / 2));
            right = Math.floor(pointC.getX() + 1);
            var pointD = this.__findCornerFromCenter(halfWidth, 0, left, right, halfHeight, deltaY, top, bottom, Math.floor(halfWidth / 2));
            bottom = Math.floor(pointD.getY() + 1);

            var pointA = this.__findCornerFromCenter(halfWidth, 0, left, right, halfHeight, -deltaY, top, bottom, Math.floor(halfWidth / 4));

            return [pointA, pointB, pointC, pointD];
        },

        __findCornerFromCenter : function (centerX, deltaX, left, right, centerY, deltaY, top, bottom, maxWhiteRun) {
            var lastRange = null;
            for (var y = centerY, x = centerX; y < bottom && y >= top && x < right && x >= left; y += deltaY, x += deltaX) {
                var range = null;
                if (deltaX == 0) {
                    range = this.__blackWhiteRange(y, maxWhiteRun, left, right, true);
                } else {
                    range = this.__blackWhiteRange(x, maxWhiteRun, top, bottom, false);
                }
                if (range == null) {
                    if (lastRange == null) {
                        throw new NotFoundException();
                    }
                    if (deltaX == 0) {
                        var lastY = y - deltaY;
                        if (lastRange[0] < centerX) {
                            if (lastRange[1] < centerY) {
                                return new ResultPoint(deltaY > 0 ? lastRange[0] : lastRange[1], lastY);
                            }
                            return new ResultPoint(lastX, lastRange[0]);
                        } else {
                            return new ResultPoint(lastX, lastRange[1]);
                        }
                    }
                }
                lastRange = range;
            }
            throw new NotFoundException();
        },

        __blackWhiteRange : function (fixedDimension, maxWhiteRun, minDim, maxDim, horizontal) {
            var center = Math.floor((minDim + maxDim) / 2);

            var start = center;
            while (start >= minDim) {
                if (horizontal ? this.__image.get(start, fixedDimension) : this.__image.get(fixedDimension, start)) {
                    start--;
                } else {
                    var whiteRunStart = start;
                    do {
                        start--;
                    } while (start >= minDim && !(horizontal ? this.__image.get(start, fixedDimension) : this.__image.get(fixedDimension, start)));
                    var whiteRunSize = whiteRunStart - start;
                    if (start < minDim || whiteRunSize > maxWhiteRun) {
                        start = whiteRunStart;
                        break;
                    }
                }
            }
            start++;

            var end = center;
            while (end < maxDim) {
                if (horizontal ? this.__image.get(end, fixedDimension) : this.__image.get(fixedDimension, end)) {
                    end++;
                } else {
                    var whiteRunStart = end;
                    do {
                        end++;
                    } while (end < maxDim && !(horizontal ? this.__image.get(end, fixedDimension) : this.__image.get(fixedDimension, end)));
                    var whiteRunSize = end - whiteRunStart;
                    if (end >= maxDim || whiteRunSize > maxWhiteRun) {
                        end = whiteRunStart;
                        break;
                    }
                }
            }
            end--;

            return end > start ? new Uint32Array([start, end]) : null;
        }
    });

    return MonochromeRectangleDetector;
});