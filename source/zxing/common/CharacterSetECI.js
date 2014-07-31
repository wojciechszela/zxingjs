define([
    'dejavu/FinalClass',
    'zxing/exception/FormatException',
    'mout/lang/isUndefined'
], function (FinalClass, FormatException, isUndefined) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var CharacterSetECI = FinalClass.declare({
        $name : 'zxing/common/CharacterSetECI',

        __values : null,

        __names : null,

        initialize : function (values, names) {
            this.__values = value;
            this.__names  = names ? names : [];
        },

        getValue : function () {
            return this.__values[0];
        },

        $statics : {
            Cp437      : [[0, 2]],
            ISO8859_1  : [[1, 3], ['ISO-8859-1']],
            ISO8859_2  : [[4],    ['ISO-8859-2']],
            ISO8859_3  : [[5],    ['ISO-8859-3']],
            ISO8859_4  : [[6],    ['ISO-8859-4']],
            ISO8859_5  : [[7],    ['ISO-8859-5']],
            ISO8859_6  : [[8],    ['ISO-8859-6']],
            ISO8859_7  : [[9],    ['ISO-8859-7']],
            ISO8859_8  : [[10],   ['ISO-8859-8']],
            ISO8859_9  : [[11],   ['ISO-8859-9']],
            ISO8859_10 : [[12],   ['ISO-8859-10']],
            ISO8859_11 : [[13],   ['ISO-8859-11']],
            ISO8859_12 : [[14],   ['ISO-8859-12']],
            ISO8859_13 : [[15],   ['ISO-8859-13']],
            ISO8859_14 : [[16],   ['ISO-8859-14']],
            ISO8859_15 : [[17],   ['ISO-8859-15']],
            ISO8859_16 : [[18],   ['ISO-8859-16']],
            SJIS       : [[20],   ['Shift_JIS']],
            Cp1250     : [[21],   ['windows-1250']],
            Cp1251     : [[22],   ['windows-1251']],
            Cp1252     : [[23],   ['windows-1252']],
            Cp1256     : [[24],   ['windows-1256']],
            UnicodeBigUnmarked : [[25], ['UTF-16BE', 'UnicodeBig']],
            UTF8    : [[26], ['UTF-8']],
            ASCII   : [[27, 170], ['US-ASCII']],
            Big5    : [[28]],
            GB18030 : [[29], ['GB2312', 'EUC_CN', 'GBK']],
            EUC_KR  : [[30], 'EUC-KR'],

            VALUE_TO_ECI : {
                0  : 'Cp437',
                1  : 'ISO8859_1',
                2  : 'Cp437',
                3  : 'ISO8859_1',
                4  : 'ISO8859_2',
                5  : 'ISO8859_3',
                6  : 'ISO8859_4',
                7  : 'ISO8859_5',
                8  : 'ISO8859_6',
                9  : 'ISO8859_7',
                10 : 'ISO8859_8',
                11 : 'ISO8859_9',
                12 : 'ISO8859_10',
                13 : 'ISO8859_11',
                14 : 'ISO8859_12',
                15 : 'ISO8859_13',
                16 : 'ISO8859_14',
                17 : 'ISO8859_15',
                18 : 'ISO8859_16',
                20 : 'SJIS',
                21 : 'Cp1250',
                22 : 'Cp1251',
                23 : 'Cp1252',
                24 : 'Cp1256',
                25 : 'UnicodeBigUnmarked',
                26 : 'UTF8',
                27 : 'ASCII',
                28 : 'Big5',
                29 : 'GB18030',
                30 : 'EUC_KR',
                170 : 'ASCII'
            },

            NAME_TO_ECI : {
                'Cp437'        : 'Cp437',
                'ISO8859_1'    : 'ISO8859_1',
                'ISO-8859-1'   : 'ISO8859_1',
                'ISO8859_2'    : 'ISO8859_2',
                'ISO-8859-2'   : 'ISO8859_2',
                'ISO8859_3'    : 'ISO8859_3',
                'ISO-8859-3'   : 'ISO8859_3',
                'ISO8859_4'    : 'ISO8859_4',
                'ISO-8859-4'   : 'ISO8859_4',
                'ISO8859_5'    : 'ISO8859_5',
                'ISO-8859-5'   : 'ISO8859_5',
                'ISO8859_6'    : 'ISO8859_6',
                'ISO-8859-6'   : 'ISO8859_6',
                'ISO8859_7'    : 'ISO8859_7',
                'ISO-8859-7'   : 'ISO8859_7',
                'ISO8859_8'    : 'ISO8859_8',
                'ISO-8859-8'   : 'ISO8859_8',
                'ISO8859_9'    : 'ISO8859_9',
                'ISO-8859-9'   : 'ISO8859_9',
                'ISO8859_10'   : 'ISO8859_10',
                'ISO-8859-10'  : 'ISO8859_10',
                'ISO8859_11'   : 'ISO8859_11',
                'ISO-8859-11'  : 'ISO8859_11',
                'ISO8859_12'   : 'ISO8859_12',
                'ISO-8859-12'  : 'ISO8859_12',
                'ISO8859_13'   : 'ISO8859_13',
                'ISO-8859-13'  : 'ISO8859_13',
                'ISO8859_14'   : 'ISO8859_14',
                'ISO-8859-14'  : 'ISO8859_14',
                'ISO8859_15'   : 'ISO8859_15',
                'ISO-8859-15'  : 'ISO8859_15',
                'ISO8859_16'   : 'ISO8859_16',
                'ISO-8859-16'  : 'ISO8859_16',
                'SJIS'         : 'SJIS',
                'Shift_JIS'    : 'SJIS',
                'Cp1250'       : 'Cp1250',
                'windows-1250' : 'Cp1250',
                'Cp1251'       : 'Cp1251',
                'windows-1251' : 'Cp1251',
                'Cp1252'       : 'Cp1252',
                'windows-1252' : 'Cp1252',
                'Cp1256'       : 'Cp1256',
                'windows-1256' : 'Cp1256',
                'UnicodeBigUnmarked' : 'UnicodeBigUnmarked',
                'UTF-16BE'     : 'UnicodeBigUnmarked',
                'UnicodeBig'   : 'UnicodeBigUnmarked',
                'UTF8'         : 'UTF8',
                'UTF-8'        : 'UTF8',
                'ASCII'        : 'ASCII',
                'US-ASCII'     : 'ASCII',
                'Big5'         : 'Big5',
                'GB18030'      : 'GB18030',
                'GB2312'       : 'GB18030',
                'EUC_CN'       : 'GB18030',
                'GBK'          : 'GB18030',
                'EUC_KR'       : 'EUC_KR',
                'EUC-KR'       : 'EUC_KR'
            },

            __instances : {},

            getCharacterSetECIByValue : function (value) {
                if (value < 0 || value >= 900) {
                    throw new FormatException();
                }
                if (isUndefined(this.$static.VALUE_TO_ECI[value])) {
                    throw new FormatException();
                }

                return this.$static.__getInstance(this.$static.VALUE_TO_ECI[value]);
            },

            getCharacterSetEciByName : function (name) {
                if (isUndefined(this.$static.NAME_TO_ECI[name])) {
                    throw new FormatException();
                }

                return this.$static.__getInstance(this.$static.NAME_TO_ECI[name]);
            },

            __getInstance : function (name) {
                if (isUndefined(this.$static.__instances)) {
                    this.$static.__instances[name] = new CharacterSetECI(CharacterSetECI.$static[name][0], CharacterSetECI.$static[name][1]);
                }

                return this.$static.__instances[name];
            }
        }
    });

    return CharacterSetECI;
});