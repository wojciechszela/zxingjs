define([
    'dejavu/FinalClass',
    'zxing/exception/IllegalArgumentException',
    'mout/lang/isUndefined'
], function (FinalClass, IllegalArgumentException, isUndefined) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Mode = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/Mode',

        __characterCountBitsForVersions : null,
        __bits : 0,

        initialize : function (characterCountBitsForVersion, bits) {
            if (1 == arguments.length) {
                characterCountBitsForVersion = arguments[0][0];
                bits = arguments[0][1];
            }
            this.__characterCountBitsForVersions = characterCountBitsForVersion;
            this.__bits = bits;
        },

        $statics : {
            TERMINATOR           : [new Uint32Array([ 0,  0,  0]), 0x00],
            NUMERIC              : [new Uint32Array([10, 12, 14]), 0x01],
            ALPHANUMERIC         : [new Uint32Array([ 9, 11, 13]), 0x02],
            STRUCTURED_APPEND    : [new Uint32Array([ 0,  0,  0]), 0x03],
            BYTE                 : [new Uint32Array([ 8, 16, 16]), 0x04],
            ECI                  : [new Uint32Array([ 0,  0,  0]), 0x07],
            KANJI                : [new Uint32Array([ 8, 10, 12]), 0x08],
            FNC1_FIRST_POSITION  : [new Uint32Array([ 0,  0,  0]), 0x05],
            FNC1_SECOND_POSITION : [new Uint32Array([ 0,  0,  0]), 0x09],
            HANZI                : [new Uint32Array([ 8, 10, 12]), 0x0D],

            __instances : {},

            instance : function (mode) {
                if (isUndefined(this.__instances[mode])) {
                    this.__instances[mode] = new Mode(this.$static[mode]);
                }

                return this.__instances[mode];
            },

            forBits : function (bits) {
                switch (bits) {
                    case 0x0:
                        return this.$static.instance('TERMINATOR');
                    case 0x1:
                        return this.$static.instance('NUMERIC');
                    case 0x2:
                        return this.$static.instance('ALPHANUMERIC');
                    case 0x3:
                        return this.$static.instance('STRUCTURED_APPEND');
                    case 0x4:
                        return this.$static.instance('BYTE');
                    case 0x5:
                        return this.$static.instance('ECI');
                    case 0x7:
                        return this.$static.instance('KANJI');
                    case 0x8:
                        return this.$static.instance('FNC1_FIRST_POSITION');
                    case 0x9:
                        return this.$static.instance('FNC1_SECOND_POSITION');
                    case 0xD:
                        return this.$static.instance('HANZI');
                    default:
                        throw new IllegalArgumentException();
                }
            }
        },

        getCharacterCountBits : function (version) {
            var number = version.getVersionNumber();
            var offset = 0;
            if (number <= 9) {
                offset = 0;
            } else if (number <= 26) {
                offset = 1;
            } else {
                offset = 2;
            }
            return this.__characterCountBitsForVersions[offset];
        },

        getBits : function () {
            return this.__bits;
        }
    });

    return Mode;
});