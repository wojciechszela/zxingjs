define([
    'dejavu/FinalClass',
    'zxing/DecodeHintType',
    'mout/lang/isObject',
    'mout/lang/isString'
], function (FinalClass, DecodeHintType, isObject, isString) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var StringUtils = FinalClass.declare({
        $name: 'zxing/common/StringUtils',

        $finals : {
            $statics : {
                PLATFORM_DEFAULT_ENCODING : 'UTF-16',
                SHIFT_JIS : 'SJIS',
                GB2312 : 'GB2312',
                EUC_JP : 'EUC_JP',
                UTF8 : 'UTF8',
                ISO88591 : 'ISO8859_1',
                ASSUME_SHIFT_JIS : false
            }
        },

        $statics : {
            guessEncoding : function (bytes, hints) {
                if (isObject(hints)) {
                    var characterSet = hints[DecodeHintType.$static.CHARACTER_SET];
                    if (isString(characterSet)) {
                        return characterSet;
                    }
                }

                var length = bytes.length;
                var canBeISO88591 = true;
                var canBeShiftJIS = true;
                var canBeUTF8 = true;
                var utf8BytesLeft = 0;
                var utf2BytesChars = 0;
                var utf3BytesChars = 0;
                var utf4BytesChars = 0;
                var sjisBytesLeft = 0;
                var sjisKatakanaChars = 0;
                var sjisCurKatakanaWordLength = 0;
                var sjisCurDoubleBytesWordLength = 0;
                var sjisMaxKatakanaWordLength = 0;
                var sjisMaxDoubleBytesWordLength = 0;
                var isoHighOther = 0;

                var utf8bom = bytes.length > 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF;

                for (var i = 0; i < length && (canBeISO88591 || canBeShiftJIS || canBeUTF8); i++) {
                    var value = bytes[i] & 0xFF;

                    if (canBeUTF8) {
                        if (utf8BytesLeft > 0) {
                            if ((value & 0x80) == 0) {
                                canBeUTF8 = false;
                            } else {
                                utf8BytesLeft--;
                            }
                        } else if ((value & 0x80) != 0) {
                            if ((value & 0x40) == 0) {
                                canBeUTF8 = false;
                            } else {
                                utf8BytesLeft++;
                                if ((value & 0x20) == 0) {
                                    utf2BytesChars++;
                                } else {
                                    utf8BytesLeft++;
                                    if ((value & 0x10) == 0) {
                                        utf8BytesChars++;
                                    } else {
                                        utf8BytesLeft++;
                                        if ((value & 0x08) == 0) {
                                            utf4BytesChars++;
                                        } else {
                                            canBeUTF8 = false;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (canBeISO88591) {
                        if (value > 0x7F && value < 0xA0) {
                            canBeISO88591 = false;
                        } else if (value > 0x9F) {
                            if (value < 0xC0 || value == 0xD7 || value == 0xF7) {
                                isoHighOther++;
                            }
                        }
                    }

                    if (canBeShiftJIS) {
                        if (sjisBytesLeft > 0) {
                            if (value < 0x40 || value == 0x7F || value > 0xFC) {
                                canBeShiftJIS = false;
                            } else {
                                sjisBytesLeft--;
                            }
                        } else if (value == 0x80 || value == 0xA0 || value > 0xEF) {
                            canBeShiftJIS = false;
                        } else if (value > 0xA0 && value < 0xE0) {
                            sjisKatakanaChars++;
                            sjisCurDoubleBytesWordLength = 0;
                            sjisCurKatakanaWordLength++;
                            if (sjisCurKatakanaWordLength > sjisMaxKatakanaWordLength) {
                                sjisMaxKatakanaWordLength = sjisCurKatakanaWordLength;
                            }
                        } else if (value > 0x7F) {
                            sjisBytesLeft++;
                            sjisCurKatakanaWordLength = 0;
                            sjisCurDoubleBytesWordLength++;
                            if (sjisCurDoubleBytesWordLength > sjisMaxDoubleBytesWordLength) {
                                sjisMaxDoubleBytesWordLength = sjisCurDoubleBytesWordLength;
                            }
                        } else {
                            sjisCurDoubleBytesWordLength = 0;
                        }
                    }

                    if (canBeUTF8 && utf8BytesLeft > 0) {
                        canBeUTF8 = false;
                    }
                    if (canBeShiftJIS && sjisBytesLeft > 0) {
                        canBeShiftJIS = false;
                    }

                    if (canBeUTF8 && (utf8bom || utf2BytesChars + utf3BytesChars + utf4BytesChars > 0)) {
                        return this.$static.UTF8;
                    }

                    if (canBeShiftJIS && (this.$static.ASSUME_SHIFT_JIS || sjisMaxKatakanaWordLength >= 3 || sjisMaxDoubleBytesWordLength >= 3)) {
                        return this.$static.SHIFT_JIS;
                    }

                    if (canBeISO88591 && canBeShiftJIS) {
                        return (sjisMaxKatakanaWordLength == 2 && sjisKatakanaChars == 2) || isoHighOther * 10 >= length ? this.$static.SHIFT_JIS : this.$static.ISO88591;
                    }

                    if (canBeISO88591) {
                        return this.$static.ISO88591;
                    }
                    if (canBeShiftJIS) {
                        return this.$static.SHIFT_JIS;
                    }
                    if (canBeUTF8) {
                        return this.$static.UTF8;;
                    }

                    return this.$static.PLATFORM_DEFAULT_ENCODING;
                }
            },

            /**
             * @todo take encoding into account
             */
            decodeBytes : function (bytes, encoding) {
                var str = "";

                for (var i = 0; i < bytes.length; i++) {
                    str += String.fromCharCode(bytes[i]);
                }

                return str;
            }
        }
    });

    return StringUtils;
});