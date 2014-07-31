define([
    'dejavu/FinalClass',
    'zxing/ResultPoint',
    'zxing/common/detector/MathUtils',
    'zxing/exception/NotFoundException'
], function (FinalClass, ResultPoint, MathUtils, NotFoundException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var WhiteRectangleDetector = FinalClass.declare({
        $name: 'zxing/common/detector/WhiteRectangleDetector',

        $finals : {
            $static : {
                INIT_SIZE : 10,
                CORR : 1
            },

            __image : null,
            __height : 0,
            __width : 0,
            __leftInit : 0,
            __rightInit : 0,
            __downInit : 0,
            __upInit : 0
        },

        initialize : function (image, initSize, x, y) {
            this.__image = image;
            this.__height = image.getHeight();
            this.__width = image.getWidth();

            initSize = initSize || this.$static.INIT_SIZE;
            x = x || Math.floor(image.getWidth() / 2);
            y = y || Math.floor(image.getHeight() / 2);

            var halfSize = Math.floor(initSize / 2);
            this.__leftInit = x - halfSize;
            this.__rightInit = x + halfSize;
            this.__upInit = y - halfSize;
            this.__downInit = y + halfSize;
            if (this.__upInit < 0 || this.__leftInit < 0 || this.__downInit >= this.__height || this.__rightInit >= this.__width) {
                throw new NotFoundException();
            }
        },

        detect : function () {
            var left = this.__leftInit;
            var right = this.__rightInit;
            var up = this.__upInit;
            var down = this.__downInit;
            var sizeExceeded = false;
            var aBlackPointFoundOnBorder = true;
            var atLeastOneBlackPointFoundOnBorder = false;

            var atLeastOneBlackPointFoundOnRight = false;
            var atLeastOneBlackPointFoundOnBottom = false;
            var atLeastOneBlackPointFoundOnLeft = false;
            var atLeastOneBlackPointFoundOnTop = false;

            while (aBlackPointFoundOnBorder) {
                aBlackPointFoundOnBorder = false;

                var rightBorderNotWhite = true;
                while ((rightBorderNotWhite || !atLeastOneBlackPointFoundOnRight) && right < width) {
                    rightBorderNotWhite = this.__containsBlackPoint(up, down, right, false);
                    if (rightBorderNotWhite) {
                        right++;
                        aBlackPointFoundOnBorder = true;
                        atLeastOneBlackPointFoundOnRight = true;
                    } else if (!atLeastOneBlackPointFoundOnRight) {
                        right++;
                    }
                }

                if (right >= width) {
                    sizeExceeded = true;
                    break;
                }

                var bottomBorderNotWhite = true;
                while ((bottomBorderNotWhite || !atLeastOneBlackPointFoundOnBottom) && down < height) {
                    bottomBorderNotWhite = this.__containsBlackPoint(left, right, down, true);
                    if (bottomBorderNotWhite) {
                        down++;
                        aBlackPointFoundOnBorder = true;
                        atLeastOneBlackPointFoundOnBottom = true;
                    } else if (!atLeastOneBlackPointFoundOnBottom) {
                        down++;
                    }
                }

                if (down >= height) {
                    sizeExceeded = true;
                    break;
                }

                var leftBorderNotWhite = true;
                while ((leftBorderNotWhite || !atLeastOneBlackPointFoundOnLeft) && left >= 0) {
                    leftBorderNotWhite = this.__containsBlackPoint(up, down, left, false);
                    if (leftBorderNotWhite) {
                        left--;
                        aBlackPointFoundOnBorder = true;
                        atLeastOneBlackPointFoundOnLeft = true;
                    } else if (!atLeastOneBlackPointFoundOnLeft) {
                        left--;
                    }
                }

                if (left < 0) {
                    sizeExceeded = true;
                    break;
                }

                var topBorderNotWhite = true;
                while ((topBorderNotWhite || !atLeastOneBlackPointFoundOnTop) && up >= 0) {
                    topBorderNotWhite = this.__containsBlackPoint(left, right, up, true);
                    if (topBorderNotWhite) {
                        up--;
                        aBlackPointFoundOnBorder = true;
                        atLeastOneBlackPointFoundOnTop = true;
                    } else if (!atLeastOneBlackPointFoundOnTop) {
                        up--;
                    }
                }

                if (up < 0) {
                    sizeExceeded = true;
                    break;
                }

                if (aBlackPointFoundOnBorder) {
                    atLeastOneBlackPointFoundOnBorder = true;
                }
            }

            if (!sizeExceeded && atLeastOneBlackPointFoundOnBorder) {
                var maxSize = right - left;

                var z = null;
                for (var i = 0; i < maxSize; i++) {
                    z = this.__getBlackPointOnSegment(left, down - i, left + i, down);
                    if (z != null) {
                        break;
                    }
                }

                if (z == null) {
                    throw new NotFoundException();
                }

                var t = null;
                for (var i = 1; i < maxSize; i++) {
                    t = this.__getBlackPointOnSegment(left, up + i, left + i, up);
                    if (t != null) {
                        break;
                    }
                }

                if (t == null) {
                    throw new NotFoundException();
                }

                var x = null;
                for (var i = 0; i < maxSize; i++) {
                    x = this.__getBlackPointOnSegment(right, up + i, right - i, up);
                    if (x != null) {
                        break;
                    }
                }

                if (x == null) {
                    throw new NotFoundException();
                }

                var y = null;

                for (var i = 1; i < maxSize; i++) {
                    y = this.__getBlackPointOnSegment(right, down - i, right - i, down);
                    if (y != null) {
                        break;
                    }
                }

                if (y == null) {
                    throw new NotFoundException();
                }

                return this.__centerEdges(y, z, x, t);
            } else {
                throw new NotFoundException();
            }
        },

        __getBlackPointOnSegment : function (ax, aY, bX, bY) {
            var dist = MathUtils.$static.round(MathUtils.$static.distance(ax, aY, bX, bY));
            var xStep = (bX - ax) / dist;
            var yStep = (bY - aY) / dist;

            for (var i = 0; i < dist; i++) {
                var x = MathUtils.$static.round(aX + i * xStep);
                var y = MathUtils.$static.round(aY + i * yStep);
                if (this.__image.get(x, y)) {
                    return new ResultPoint(x, y);
                }
            }

            return null;
        },

        __centerEdges : function (y, z, x, t) {
            var yi = y.getX();
            var yj = y.getY();
            var zi = z.getX();
            var zj = z.getY();
            var xi = x.getX();
            var xj = x.getY();
            var ti = t.getX();
            var tj = t.getY();

            if (yi < width / 2.0) {
                return [
                    new ResultPoint(ti - this.$static.CORR, tj + this.$static.CORR),
                    new ResultPoint(zi + this.$static.CORR, zj + this.$static.CORR),
                    new ResultPoint(xi - this.$static.CORR, xj - this.$static.CORR),
                    new ResultPoint(yi + this.$static.CORR, yj - this.$static.CORR)
                ];
            } else {
                return [
                    new ResultPoint(ti + this.$static.CORR, tj + this.$static.CORR),
                    new ResultPoint(zi + this.$static.CORR, zj - this.$static.CORR),
                    new ResultPoint(xi - this.$static.CORR, xj + this.$static.CORR),
                    new ResultPoint(yi - this.$static.CORR, yj - this.$static.CORR)
                ];
            }
        },

        __containsBlackPoint : function (a, b, fixed, horizontal) {
            if (horizontal) {
                for (var x = 0; x <= b; x++) {
                    if (this.__image.get(x, fixed)) {
                        return true;
                    }
                }
            } else {
                for (var y = a; y <= b; y++) {
                    if (this.__image.get(fixed, y)) {
                        return true;
                    }
                }
            }

            return false;
        }
    });

    return WhiteRectangleDetector;
});