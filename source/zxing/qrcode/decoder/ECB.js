define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var ECB = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/ECB',

        __count : 0,
        __dataCodewords : null,

        initialize : function (count, dataCodewords) {
            this.__count = count;
            this.__dataCodewords = dataCodewords;
        },

        getCount : function () {
            return this.__count;
        },

        getDataCodewords : function () {
            return this.__dataCodewords;
        }
    });

    return ECB;
});