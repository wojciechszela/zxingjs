define([
    'dejavu/AbstractClass',
    'zxing/LuminanceSource',
    'zxing/exception/IllegalArgumentException'
], function (AbstractClass, LuminanceSource, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Binarizer = AbstractClass.declare({
        $name : 'zxing/Binarizer',

        __source : null,

        $finals : {
            getLuminanceSource : function () {
                return this.__source;
            },

            getWidth : function () {
                return this.__source.getWidth();
            },

            getHeight : function () {
                return this.__source.getHeight();
            }
        },

        initialize : function (source) {
            if (!(source instanceof LuminanceSource)) {
                throw new IllegalArgumentException();
            }

            this.__source = source;
        },

        $abstracts : {
            getBlackRow : function (y, row) {},

            getBlackMatrix : function () {},

            createBinarizer : function (source) {}
        }
    });

    return Binarizer;
});