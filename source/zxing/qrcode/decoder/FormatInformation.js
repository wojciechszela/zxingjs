define([
    'dejavu/FinalClass',
    'zxing/qrcode/decoder/ErrorCorrectionLevel'
], function (FinalClass, ErrorCorrectionLevel) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var FormatInformation = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/FormatInformation',

        $finals : {
            $statics : {
                FORMAT_INFO_MASK_QR : 0x5412,
                FORMAT_INFO_DECODE_LOOKUP : [
                     new Uint32Array([0x5412, 0x00]),
                     new Uint32Array([0x5125, 0x01]),
                     new Uint32Array([0x5E7C, 0x02]),
                     new Uint32Array([0x5B4B, 0x03]),
                     new Uint32Array([0x45F9, 0x04]),
                     new Uint32Array([0x40CE, 0x05]),
                     new Uint32Array([0x4F97, 0x06]),
                     new Uint32Array([0x4AA0, 0x07]),
                     new Uint32Array([0x77C4, 0x08]),
                     new Uint32Array([0x72F3, 0x09]),
                     new Uint32Array([0x7DAA, 0x0A]),
                     new Uint32Array([0x789D, 0x0B]),
                     new Uint32Array([0x662F, 0x0C]),
                     new Uint32Array([0x6318, 0x0D]),
                     new Uint32Array([0x6C41, 0x0E]),
                     new Uint32Array([0x6976, 0x0F]),
                     new Uint32Array([0x1689, 0x10]),
                     new Uint32Array([0x13BE, 0x11]),
                     new Uint32Array([0x1CE7, 0x12]),
                     new Uint32Array([0x19D0, 0x13]),
                     new Uint32Array([0x0762, 0x14]),
                     new Uint32Array([0x0255, 0x15]),
                     new Uint32Array([0x0D0C, 0x16]),
                     new Uint32Array([0x083B, 0x17]),
                     new Uint32Array([0x355F, 0x18]),
                     new Uint32Array([0x3068, 0x19]),
                     new Uint32Array([0x3F31, 0x1A]),
                     new Uint32Array([0x3A06, 0x1B]),
                     new Uint32Array([0x24B4, 0x1C]),
                     new Uint32Array([0x2183, 0x1D]),
                     new Uint32Array([0x2EDA, 0x1E]),
                     new Uint32Array([0x2BED, 0x1F])
                ],
                BITS_SET_IN_HALF_BYTE : new Uint32Array([0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4])
            }
        },

        __errorCorrectionLevel : null,

        __dataMask : null,

        initialize : function (formatInfo) {
            this.__errorCorrectionLevel = ErrorCorrectionLevel.$static.forBits((formatInfo >> 3) & 0x03);
            this.__dataMask = (formatInfo & 0x07);
        },

        $statics : {
            numBitsDiffering : function (a, b) {
                a ^= b;
                return this.$static.BITS_SET_IN_HALF_BYTE[a & 0x0F]
                     + this.$static.BITS_SET_IN_HALF_BYTE[(a >>> 4 & 0x0F)]
                     + this.$static.BITS_SET_IN_HALF_BYTE[(a >>> 8 & 0x0F)]
                     + this.$static.BITS_SET_IN_HALF_BYTE[(a >>> 12 & 0x0F)]
                     + this.$static.BITS_SET_IN_HALF_BYTE[(a >>> 16 & 0x0F)]
                     + this.$static.BITS_SET_IN_HALF_BYTE[(a >>> 20 & 0x0F)]
                     + this.$static.BITS_SET_IN_HALF_BYTE[(a >>> 24 & 0x0F)]
                     + this.$static.BITS_SET_IN_HALF_BYTE[(a >>> 28 & 0x0F)];
            },

            decodeFormatInformation : function (maskedFormatInfo1, maskedFormatInfo2) {
                var formatInfo = this.$static.doDecodeFormatInformation(maskedFormatInfo1, maskedFormatInfo2);
                if (formatInfo instanceof FormatInformation) {
                    return formatInfo;
                }

                return this.$static.doDecodeFormatInformation(maskedFormatInfo1 ^ this.$static.FORMAT_INFO_MASK_QR, maskedFormatInfo2 ^ this.$static.FORMAT_INFO_MASK_QR);
            },

            doDecodeFormatInformation : function (maskedFormatInfo1, maskedFormatInfo2) {
                var bestDifference = Math.pow(2, 31) - 1; // Number.MAX_VALUE;
                var bestFormatInfo = 0;
                for (var _i = 0; _i < this.$static.FORMAT_INFO_DECODE_LOOKUP.length; _i++) {
                    var decodeInfo = this.$static.FORMAT_INFO_DECODE_LOOKUP[_i];
                    var targetInfo = decodeInfo[0];
                    if (targetInfo == maskedFormatInfo1 || targetInfo == maskedFormatInfo2) {
                        return new FormatInformation(decodeInfo[1]);
                    }
                    var bitsDifference = this.$static.numBitsDiffering(maskedFormatInfo1, targetInfo);
                    if (bitsDifference < bestDifference) {
                        bestFormatInfo = decodeInfo[1];
                        bestDifference = bitsDifference;
                    }
                    if (maskedFormatInfo1 != maskedFormatInfo2) {
                        bitsDifference = this.$static.numBitsDiffering(maskedFormatInfo2, targetInfo);
                        if (bitsDifference < bestDifference) {
                            bestFormatInfo = decodeInfo[1];
                            bestDifference = bitsDifference;
                        }
                    }
                }

                if (bestDifference <= 3) {
                    return new FormatInformation(bestFormatInfo);
                }
                return null;
            }
        },

        getErrorCorrectionLevel : function () {
            return this.__errorCorrectionLevel;
        },

        getDataMask : function () {
            return this.__dataMask;
        }
    });

    return FormatInformation;
});