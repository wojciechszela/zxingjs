define([
    'dejavu/FinalClass',
    'zxing/Binarizer',
    'zxing/exception/IllegalArgumentException'
], function (FinalClass, Binarizer, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var BinaryBitmap = FinalClass.declare({
        $name : 'zxing/BinaryBitmap',

        __binarizer : null,

        __matrix : null,

        /**
         * @todo finish docs
         * @param {Binarizer} binarizer
         */
        initialize : function (binarizer) {
            if (binarizer === null || !(binarizer instanceof Binarizer)) {
                throw new IllegalArgumentException();
            }

            this.__binarizer = binarizer;
        },

        getWidth : function () {
            return this.__binarizer.getWidth();
        },

        getHeight : function () {
            return this.__binarizer.getHeight();
        },

        getBlackRow : function (y, row) {
            return this.__binarizer.getBlackRow(y, row);
        },

        getBlackMatrix : function () {
            if (null === this.__matrix) {
                this.__matrix = this.__binarizer.getBlackMatrix();
            }

            return this.__matrix;
        },

        isCropSupported : function () {
            return this.__binarizer.getLuminanceSource().isCropSupported();
        },

        crop : function (left, top, width, height) {
            var newSource = this.__binarizer.getLuminanceSource().crop(left, top, width, height);
            return new BinaryBitamp(this.__binarizer.createBinarizer(newSource));
        },

        isRotateSupported : function () {
            return this.__binarizer.getLuminanceSource().isRotateSupported();
        },

        rotateCounterClockwise : function () {
            var newSource = this.__binarizer.getLuminanceSource().rotateCounterClockwise();
            return new BinaryBitamp(this.__binarizer.createBinarizer(newSource));
        },

        rotateCounterClockwise45 : function () {
            var newSource = this.__binarizer.getLuminanceSource().rotateCounterClockwise45();
            return new BinaryBitamp(this.__binarizer.createBinarizer(newSource));
        },

        toString : function () {
            try {
                return this.getBlackMatrix().toString();
            } catch (e) {
                return '';
            }
        }
    });

    return BinaryBitmap;
});