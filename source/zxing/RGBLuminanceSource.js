define([
    'dejavu/FinalClass',
    'zxing/LuminanceSource',
    'zxing/exception/IllegalArgumentException',
    'zxing/lang/arrayCopy',
    'mout/lang/isUndefined'
], function (FinalClass, LuminanceSource, IllegalArgumentException, arrayCopy, isUndefined) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var RGBLuminanceSource = FinalClass.declare({
        $name    : 'zxing/RGBLuminanceSource',
        $extends : LuminanceSource,

        __luminances : null,

        __pixels : null,

        __dataWidth : null,

        __dataHeight : null,

        __left : null,

        __top : null,

        initialize : function (width, height, pixels, left, top, dataWidth, dataHeight) {
            this.$super(width, height);

            if (!isUndefined(left) && !isUndefined(top) && !isUndefined(dataWidth) && !isUndefined(dataHeight)) {
                this.__initializeInternal(width, height, pixels, left, top, dataWidth, dataHeight);
            } else {
                this.__initializeDefault(width, height, pixels);
            }
        },

        __initializeDefault : function (width, height, pixels) {
            this.__dataWidth  = width;
            this.__dataHeight = height;
            this.__left       = 0;
            this.__top        = 0;

            this.__pixels = pixels;

        },

        __initializeInternal : function (width, height, pixels, left, top, dataWidth, dataHeight) {
            if (left + width > dataWidth || top + height > dataHeight) {
                throw new IllegalArgumentException('Crop rectangle does not fit withing image data');
            }

            this.__pixels     = pixels;
            this.__dataWidth  = dataWidth;
            this.__dataHeight = dataHeight;
            this.__left       = left;
            this.__top        = top;
        },

        getRow : function (y, row) {
            if (y < 0 || y >= this.getHeight()) {
                throw new IllegalArgumentException('Request row is outside the image: ' + y);
            }

            var width = this.getWidth();
            if (null === row || row.length < width) {
                row = new Uint8Array(width);
            }

            var offset = (y + this.__top) * this.__dataWidth * 4 + this.__left * 4;
            for (var _i = 0; _i < width; _i++) {
                row[_i] = (this.__pixels[offset + _i * 4] + 2 * this.__pixels[offset + _i * 4 + 1] + this.__pixels[offset + _i * 4 + 2])/4;
            }

            return row;
        },

        getMatrix : function () {
            var width = this.getWidth();
            var height = this.getHeight();

//            if (width === this.__dataWidth && height === this.__dataHeight) {
//                return this.__luminances;
//            }

            var area = width * height;
            var matrix = new Uint8Array(area);
            for (var y = 0; y < height; y++) {
                var yOffset = y * width * 4;
                for (var x = 0; x < width; x++) {
                    var offset = yOffset + x * 4;
                    matrix[y * width + x] = (this.__pixels[offset] + 2 * this.__pixels[offset + 1] + this.__pixels[offset + 2]) / 4;
                }
            }
//            for (var y = 0; y < height; y++) {
//                var outputOffset = y * width;
//                matrix = arrayCopy(rgb, inputOffset, matrix, outputOffset, width);
//                inputOffset += this.__dataWidth;
//            }
            return matrix;
        },

        isCropSupported : function () {
            return true;
        },

        crop : function (left, top, width, height) {
            return new RGBLuminanceSource(this.__dataWidth, this.__dataHeight, this.__pixels, this.__left + left, this.__top + top, width, height);
        }
    });

    return RGBLuminanceSource;
});