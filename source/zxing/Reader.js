define([
    'dejavu/Interface'
], function (Interface) {
    'use strict';

    var Reader = Interface.declare({
        $name: 'zxing/Reader',

        /**
         * Locates and decodes a barcode in some format within an image
         *
         * @param {BinaryBitmap} image image of barcode to decore
         * @param {Object} hints
         */
        decode : function (image, hints) {},

        reset : function () {}
    });

    return Reader;
});