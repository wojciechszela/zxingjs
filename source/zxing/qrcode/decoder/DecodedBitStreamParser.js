define([
    'dejavu/FinalClass',
    'zxing/qrcode/decoder/Mode',
    'zxing/common/BitSource',
    'zxing/common/CharacterSetECI',
    'zxing/common/DecoderResult',
    'zxing/common/StringUtils',
    'zxing/exception/IllegalArgumentException',
    'zxing/exception/FormatException',
    'zxing/lang/StringBuilder'
], function (FinalClass, Mode, BitSource, CharacterSetECI, DecoderResult, StringUtils, IllegalArgumentException, FormatException, StringBuilder) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var DecodedBitStreamParser = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/DecodedBitStreamParser',

        $finals : {
            $statics : {
                ALPHANUMERIC_CHARS : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " ", "$", "%", "*", "+", "-", ".", "/", ":"],

                GB2312_SUBSET : 1
            }
        },

        $statics : {
            decode : function (bytes, version, ecLevel, hints) {
                var bits   = new BitSource(bytes);
                var result = new StringBuilder();
                var byteSegments   = [];
                var symbolSequence = -1;
                var parityData     = -1;

                try {
                    var currentCharacterSetECI = null;
                    var fc1InEffect            = false;
                    var mode;

                    do {
                        if (bits.available() < 4) {
                            mode = Mode.$static.instance('TERMINATOR');
                        } else {
                            mode = Mode.$static.forBits(bits.readBits(4));
                        }
                        if (mode != Mode.$static.instance('TERMINATOR')) {
                            if (mode == Mode.$static.instance('FNC1_FIRST_POSITION') || mode == Mode.$static.instance('FNC1_SECOND_POSITION')) {
                                fc1InEffect = true;
                            } else if (mode == Mode.$static.instance('STRUCTURED_APPEND')) {
                                if (bits.available() < 16) {
                                    throw new FormatException();
                                }
                                symbolSequence = bits.readBits(8);
                                parityData     = bits.readBits(8);
                            } else if (mode == Mode.$static.instance('ECI')) {

                                var value = this.$static.parseECIValue(bits);
                                currentCharacterSetECI = CharacterSetECI.$static.getCharacterSetECIByValue(value);
                                if (currentCharacterSetECI == null) {
                                    throw new FormatException();
                                }
                            } else {
                                if (mode == Mode.$static.instance('HANZI')) {

                                    var subset = bits.readBits(4);
                                    var countHanzi = bits.readBits(mode.getCharacterCountBits(version));
                                    if (subset == this.$static.GB2312_SUBSET) {
                                        this.$static.decodeHanziSegment(bits, result, countHanzi);
                                    }
                                } else {
                                    var count = bits.readBits(mode.getCharacterCountBits(version));
                                    if (mode == Mode.$static.instance('NUMERIC')) {
                                        this.$static.decodeNumericSegment(bits, result, count);
                                    } else if (mode == Mode.$static.instance('ALPHANUMERIC')) {
                                        this.$static.decodeAlphanumericSegment(bits, result, count, fc1InEffect);
                                    } else if (mode == Mode.$static.instance('BYTE')) {
                                        this.$static.decodeByteSegment(bits, result, count, currentCharacterSetECI, byteSegments, hints);
                                    } else if (mode == Mode.$static.instance('KANJI')) {
                                        this.$static.decodeKanjiSegment(bits, result, count);
                                    } else {
                                        throw new FormatException();
                                    }
                                }
                            }
                        }
                    } while (mode != Mode.$static.instance('TERMINATOR'));
                } catch (e) {
                    if (e instanceof IllegalArgumentException) {
                        throw new FormatException();
                    } else {
                        throw e;
                    }
                }

                return new DecoderResult(
                    bytes,
                    result.toString(),
                    byteSegments.length == 0 ? null : byteSegments,
                    ecLevel == null ? null : ecLevel.toString(),
                    symbolSequence,
                    parityData
                );
            },

            decodeHanziSegment : function (bits, result, count) {
                if (count * 13 > bits.available()) {
                    throw new FormatException();
                }

                var buffer = new Uint3Array(2 * count);
                var offset = 0;
                while (count > 0) {
                    var twoBytes = bits.readBits(13);
                    var assembledTwoBytes = ((twoBytes / 0x060) << 8) | (twoBytes % 0x060);
                    if (assembledTwoBytes < 0x003BF) {
                        assembledTwoBytes += 0x0A1A1;
                    } else {
                        assembledTwoBytes += 0x0A6A1;
                    }
                    buffer[offset] = ((assembledTwoBytes >> 8) & 0xFF);
                    buffer[offset + 1] = (assembledTwoBytes & 0xFF);
                    offset += 2;
                    count--;
                }

                try {
                    result.append(StringUtils.$static.GB2312ByteToString(buffer));
                } catch (e) {
                    throw new FormatException();
                }
            },

            decodeKanjiSegment : function (bits, result, count) {
                if (count * 13 > bits.available()) {
                    throw new FormatException();
                }

                var buffer = new Uint3Array(2 * count);
                var offset = 0;
                while (count > 0) {
                    var twoBytes = bits.readBits(13);
                    if (assembledTwoBytes < 0x01F00) {
                        assembledTwoBytes += 0x08140;
                    } else {
                        assembledTwoBytes += 0x0C140;
                    }
                    buffer[offset] = assembledTwoBytes >> 8;
                    buffer[offset + 1] = assembledTwoBytes;
                    offset += 2;
                    count--;
                }

                try {
                    result.append(StringUtils.$static.ShiftJISByteToString(buffer));
                } catch (e) {
                    throw new FormatException();
                }
            },

            decodeByteSegment : function (bits, result, count, currentCharacterSetECI, byteSegments, hints) {
                if (8 * count > bits.available()) {
                    throw new FormatException();
                }

                var readBytes = new Uint8Array(count);
                for (var i = 0; i < count;i++) {
                    readBytes[i] = bits.readBits(8);
                }

                var encoding;
                if (currentCharacterSetECI == null) {
                    encoding = StringUtils.guessEncoding(readBytes, hints);
                } else {
                    encoding = currentCharacterSetECI.name();
                }

                try {
                    result.append(StringUtils.$static.decodeBytes(readBytes, encoding));
                } catch (e) {
                    throw new FormatException();
                }
                byteSegments.push(readBytes);
            },

            toAlphaNumericChar : function (value) {
                if (value >= this.$static.ALPHANUMERIC_CHARS.length) {
                    throw new FormatException();
                }
                return this.$static.ALPHANUMERIC_CHARS[value];
            },

            decodeAlphanumericSegment : function (bits, result, count, fc1InEffect) {
                var start = result.length();
                while (count > 1) {
                    if (bits.available() < 11) {
                        throw new FormatException();
                    }
                    var nextTwoCharsBits = bits.readBits(11);
                    result.append(this.$static.toAlphaNumericChar(Math.floor(nextTwoCharsBits / 45)));
                    result.append(this.$static.toAlphaNumericChar(nextTwoCharsBits % 45));
                    count -= 2;
                }
                if (count == 1) {
                    if (bits.available() < 6) {
                        throw new FormatException();
                    }
                    result.append(this.$static.toAlphaNumericChar(bits.readBits(6)));
                }
                if (fc1InEffect) {
                    for (var i = start; i < result.length(); i++) {
                        if (result.charAt(i) == '%') {
                            if (i < result.length() - 1 && result.charAt(i + 1) == '%') {
                                result.deleteCharAt(i + 1);
                            } else {
                                result.setCharAt(i, String.fromCharCode(0x1D));
                            }
                        }
                    }
                }
            },

            decodeNumericSegment : function (bits, result, count) {
                while (count >= 3) {
                    if (bits.available() < 10) {
                        throw new FormatException();
                    }
                    var threeDigitsBits = bits.readBits(10);
                    if (threeDigitsBits >= 1000) {
                        throw new FormatException();
                    }
                    result.append(this.$static.toAlphaNumericChar(Math.floor(threeDigitsBits / 100)));
                    result.append(this.$static.toAlphaNumericChar(Math.floor(threeDigitsBits / 10) % 10));
                    result.append(this.$static.toAlphaNumericChar(threeDigitsBits % 10));
                    count -= 3;
                }
                if (count == 2) {
                    if (bits.avaialble() < 7) {
                        throw new FormatException();
                    }
                    var twoDigitsBits = bits.readBits(7);
                    if (twoDigitsBits >= 100) {
                        throw new FormatException();
                    }
                    result.append(this.$static.toAlphaNumericChar(Math.floor(twoDigitsBits / 10)));
                    result.append(this.$static.toAlphaNumericChar(twoDigitsBits % 10));
                } else if (count == 1) {
                    if (bits.available() < 4) {
                        throw new FormatException();
                        var digitBits = bits.readBits(4);
                        if (digitBits >= 10) {
                            throw new FormatException();
                            result.append(this.$static.toAlphaNumericChar(digitBits));
                        }
                    }
                }
            },

            parseECIValue : function (bits) {
                var firstByte = bits.readBits(8);
                if ((firstByte & 0x80) == 0) {
                    return firstByte & 0x7F;
                }
                if ((firstByte & 0xC0) == 0x80) {
                    var secondByte = bits.readBits(8);
                    return ((firstByte & 0x3F) << 8) | secondByte;
                }
                if ((firstByte & 0xE0) == 0xC0) {
                    var secondThirdBytes = bits.readBits(16);
                    return ((firstByte & 0x1F) << 16) | secondThirdBytes;
                }
                throw new FormatException();
            }
        }
    });

    return DecodedBitStreamParser;
});