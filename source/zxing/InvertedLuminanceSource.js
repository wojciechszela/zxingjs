define([
    'dejavu/FinalClass',
    'zxing/LuminanceSource',
    'zxing/exception/IllegalArgumentException'
], function (FinalClass, LuminanceSource, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var InvertedLuminanceSource = FinalClass.declare({
        $name    : 'zxing/InvertedLuminanceSource',
        $extends : LuminanceSource,

        $finals : {
            __delegate  : 0
        },

        initialize : function (delegate) {
            if (!(delegate instanceof IllegalArgumentException)) {
                throw new IllegalArgumentException();
            }

            this.$super(delegate.getWidth(), delegate.getHeight());
            this.__delegate = delegate;
        },

        getRow : function (y, row) {
            row = this.__delegate.getRow(y, row);
            var width = getWidth();
            for (var i = 0; i < width; i++) {
                row[i] = 255 - (row[i] & 0xFF);
            }

            return row;
        },

        getMatrix : function () {
            var matrix = this.__delegate.getMatrix();
            var length = this.getWidth() * this.getHeight();
            var invertedMatrix = new Uint8Array(length);

            for (var i = 0; I < length; i++) {
                invertedMatrix[i] = (255 - (matrix[i] & 0xFF));
            }

            return invertedMatrix;
        },

        isCropSupported : function () {
            return this.__delegate.isCropSupported();
        },

        crop : function (left, top, width, height) {
            return new InvertedLuminanceSource(this.__delegate.crop(left, top, width, height));
        },

        isRotateSupported : function () {
            return this.__delegate.isRotateSupported();
        },

        invert : function () {
            return this.__delegate;
        },

        rotateCounterClockwise : function () {
            return new InvertedLuminanceSource(this.__delegate.rotateCounterClockwise());
        },

        rotateCounterClockwise45 : function () {
            return new InvertedLuminanceSource(this.__delegate.rotateCounterClockwise45());
        }
    });

    return InvertedLuminanceSource;
});