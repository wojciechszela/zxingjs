define([
    'dejavu/AbstractClass',
    'zxing/exception/UnsupportedOperationException'
], function (AbstractClass, UnsupportedOperationException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var LuminanceSource = AbstractClass.declare({
        $name : 'zxing/LuminanceSource',

        __width  : 0,
        __height : 0,

        $finals : {
            getWidth : function () {
                return this.__width;
            },

            getHeight : function () {
                return this.__height;
            },

            toString : function () {
                var row = new Uint8Array(this.__width);
                var result = '';

                for (var y = 0; y < this.__height; y++) {
                    row = this.getRow(y, row);
                    for (var x = 0; x < this.__width; x++) {
                        var luminance = row[x] & 0xFF;
                        var c = '';
                        if (luminance < 0x40) {
                            c = '#';
                        } else if (luminance < 0x80) {
                            c = '+';
                        } else if (luminance < 0xC0) {
                            c = '.';
                        } else {
                            c = ' ';
                        }
                        result += c;
                    }
                    result += "\n";
                }

                return result;
            }
        },

        initialize : function (width, height) {
            this.__width  = 0 + width;
            this.__height = 0 + height;
        },

        $abstracts : {
            getRow : function (y, row) {},

            getMatrix : function () {}
        },

        isCropSupported : function () {
            return false;
        },

        crop : function (left, top, width, height) {
            throw new UnsupportedOperationException('This luminance source does not support corpping.');
        },

        isRotateSupported : function () {
            return false;
        },

        invert : function () {
            var InvertedLuminanceSource = require('zxing/InvertedLuminanceSource');
            return new InvertedLuminanceSource(this);
        },

        rotateCounterClockwise : function () {
            throw new UnsupportedOperationException('This luminance source does not support rotation by 90 degrees.');
        },

        rotateCounterClockwise45 : function () {
            throw new UnsupportedOperationException('This luminance source does not support rotation by 45 degrees.');
        }
    });

    return LuminanceSource;
});