define([
    'dejavu/FinalClass',
    'zxing/exception/IllegalArgumentException'
], function (FinalClass, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var ErrorCorrectionLevel = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/ErrorCorrectionLevel',

        $finals : {
            $statics : {
                FOR_BITS : [0x01, 0x00, 0x03, 0x02]
            }
        },

        __bits : 0,

        __ordinal : 0,

        initialize : function (bits) {
            this.__bits = bits;
            this.__ordinal = this.$static.FOR_BITS.indexOf(bits);
        },

        getBits : function () {
            return this.__bits;
        },

        ordinal : function () {
            return this.__ordinal;
        },

        $statics : {
            forBits : function (bits) {
                if (bits < 0 || bits >= this.$static.FOR_BITS.length) {
                    throw new IllegalArgumentException();
                }

                return new ErrorCorrectionLevel(this.$static.FOR_BITS[bits]);
            }
        }
    });

    return ErrorCorrectionLevel;
});