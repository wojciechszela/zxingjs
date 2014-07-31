define([
    'dejavu/FinalClass',
    'zxing/common/BitArray',
    'zxing/exception/IllegalArgumentException',
    'zxing/lang/arrayCopy',
    'mout/lang/isObject'
], function (FinalClass, BitArray, IllegalArgumentException, arrayCopy, isObject) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var BitMatrix = FinalClass.declare({
        $name: 'zxing/common/BitMatrix',

        __width   : 0,
        __height  : 0,
        __rowSize : 0,
        __bits    : null,

        initialize : function (width, height, rowSize, bits) {
            height = height || width;

            if (width < 1 || height < 1) {
                throw new IllegalArgumentException('Both dimensions must be greater than 0');
            }

            this.__width   = width;
            this.__height  = height;
            this.__rowSize = rowSize && bits ? rowSize : Math.floor((width + 31) / 32);
            this.__bits    = rowSize && bits ? bits    : new Uint32Array(this.__rowSize * height);
        },

        get : function (x, y) {
            var offset = y * this.__rowSize + Math.floor((x / 32));
            return ((this.__bits[offset] >>> (x & 0x1F)) & 1) != 0;
        },

        set : function (x, y) {
            var offset = y * this.__rowSize + Math.floor((x / 32));
            this.__bits[offset] |= 1 << (x & 0x1F);
        },

        flip : function (x, y) {
            var offset = y * this.__rowSize + Math.floor((x / 32));
            this.__bits[offset] ^= 1 << (x & 0x1F);
        },

        clear : function () {
            var max = this.__bits.length;
            for (var i = 0; i < max; i++) {
                this.__bits[i] = 0;
            }
        },

        setRegion : function (left, top, width, height) {
            if (top < 0 || left < 0) {
                throw new IllegalArgumentException('Left and top must be nonnegative');
            }

            if (height < 1 || width < 1) {
                throw new IllegalArgumentException('Height and width must be at least 1');
            }

            var right  = left + width;
            var bottom = top + height;

            if (bottom > this.__height || right > this.__width) {
                throw new IllegalArgumentException('The region must fit inside the matrix');
            }

            for (var y = top; y < bottom; y++) {
                var offset = y * this.__rowSize;
                for (var x = left; x < right; x++) {
                    this.__bits[offset + Math.floor(x / 32)] |= 1 << (x & 0x1F);
                }
            }
        },

        getRow : function (y, row) {
            if (!isObject(row) || row.getSize() < this.__width) {
                row = new BitArray(width);
            } else {
                row.clear();
            }

            var offset = y * this.__rowSize;
            for (var x = 0; x < this.__rowSize; x++) {
                row.setBulk(x * 32, this.__bits[offset + x]);
            }

            return row;
        },

        setRow : function (y, row) {
            this.__bits = arrayCopy(row.getBitArray(), 0, this.__bits, y * this.__rowSize, this.__rowSize);
        },

        rotate180 : function () {
            var width = this.getWidth();
            var height = this.getHeight();
            var topRow = new BitArray(width);
            var bottomRow = new BitArray(width);

            var stopCondition = Math.floor((height + 1) / 2);

            for (var i = 0; i < stopCondition; i++) {
                topRow = this.getRow(i, topRow);
                bottomRow = this.getRow(height - 1 - i, bottomRow);
                topRow.reverse();
                bottomRow.reverse();
                setRow(i, bottomRow);
                setRow(height - 1 - i, topRow);
            }
        },

        getEnclosingRectangle : function () {
            var left = this.__width;
            var top = this.__height;
            var right = -1;
            var bottom = -1;

            for (var y = 0; y < this.__height; y++) {
                for (var x32 = 0; x32 < this.__rowSize; x32++) {
                    var theBits = this.__bits[y * this.__rowSize + x32];
                    if (theBits != 0) {
                        if (y < top) {
                            top = y;
                        }
                        if (y > bottom) {
                            bottom = y;
                        }
                        if (x32 * 32 < left) {
                            var bit = 0;
                            while ((theBits << (31 - bit)) === 0) {
                                bit++;
                            }
                            if ((x32 * 32 + bit) < left) {
                                left = x32 * 32 + bit;
                            }
                        }
                        if (x32 * 32 + 31 > right) {
                            var bit = 31;
                            while ((theBits >>> bit) == 0) {
                                bit--;
                            }
                            if ((x32 * 32 + bit) > right) {
                                right = x32 * 32 + bit;
                            }
                        }
                    }
                }
            }

            var width  = right - left;
            var height = bottom - top;

            if (width < 0 || height < 0) {
                return null;
            }

            return [left, top, width, height];
        },

        getTopLeftOnBit : function () {
            var bitsOffset = 0;
            while (bitsOffset < this.__bits.length && this.__bits[bitsOffset] == 0) {
                bitsOffset++;
            }
            if (bitsOffset === this.__bits.length) {
                return null;
            }

            var y = Math.floor(bitsOffset / this.__rowSize);
            var x = (bitsOffset % this.__rowSize) * 32;

            var theBits = this.__bits[bitsOffset];
            var bit = 0;
            while ((theBits << (31 - bit)) === 0) {
                bit++;
            }
            x += bit;
            return [x, y];
        },

        getBottomRightOnBit : function () {
            var bitsOffset = this.__bits.length - 1;
            while (bitsOffset >= 0 && this.__bits[bitsOffset] == 0) {
                bitsOffset--;
            }
            if (bitsOffset < 0) {
                return null;
            }

            var y = Math.floor(bitsOffset / this.__rowSize);
            var x = (bitsOffset % rowSize) * 32;

            var theBits = this.__bits[bitsOffset];
            var bit = 31;
            while ((theBits >>> bit) == 0) {
                bit--;
            }

            x += bit;

            return [x, y];
        },

        getWidth : function () {
            return this.__width;
        },

        getHeight : function () {
            return this.__height;
        },

        toString : function () {
            var result = '';

            for (var y = 0; y < this.__height; y++) {
                for (var x = 0; x < this.__width; x++) {
                    result += (this.get(x, y) ? 'X ' : '  ');
                }
                result += "\n";
            }

            return result;
        }
    });

    return BitMatrix;
});