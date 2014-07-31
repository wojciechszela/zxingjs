define([
    'dejavu/FinalClass',
    'zxing/exception/IllegalArgumentException'
], function (FinalClass, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var DataMask = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/DataMask',

        $finals : {
            $statics : {
                IS_MASKED : [
                     function (i, j) {
                         return ((i + j) & 0x01) == 0;
                     },
                     function (i, j) {
                         return (i & 0x01) == 0;
                     },
                     function (i, j) {
                         return j % 3 == 0;
                     },
                     function (i, j) {
                         return (i + j) % 3 == 0;
                     },
                     function (i, j) {
                         return (((i / 2) + (j / 3)) & 0x01) == 0;
                     },
                     function (i, j) {
                         var temp = i * j;
                         return (temp & 0x01) + (temp % 3) == 0;
                     },
                     function (i, j) {
                         var temp = i * j;
                         return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
                     },
                     function (i, j) {
                         return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
                     }
                 ]
            },

            unmaskBitMatrix : function (bits, dimension) {
                for (var i = 0; i < dimension; i++) {
                    for (var j = 0; j < dimension; j++) {
                        if (this.isMasked(i, j)) {
                            bits.flip(j, i);
                        }
                    }
                }
            }
        },

        $statics : {
            forReference : function (reference) {
                if (reference < 0 || reference > 7) {
                    throw new IllegalArgumentException();
                }

                return new DataMask(reference);
            }
        },

        __pattern : null,

        initialize : function (pattern) {
            this.__pattern = pattern;
        },

        isMasked : function (i, j) {
            return this.$static.IS_MASKED[this.__pattern](i, j);
        }
    });

    return DataMask;
});