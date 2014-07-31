define([
    'dejavu/Class',
    'zxing/oned/OneDReader',
    'zxing/Result',
    'zxing/ResultPoint',
    'zxing/BarcodeFormat',
    'zxing/exception/NotFoundException',
    'zxing/exception/ChecksumException',
    'zxing/exception/FormatException',
    'zxing/lang/StringBuilder',
    'zxing/lang/arrayCopy'
], function (Class, OneDReader, Result, ResultPoint, BarcodeFormat, NotFoundException, ChecksumException, FormatException, StringBuilder, arrayCopy) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Code39Reader = Class.declare({
        $name : 'zxing/oned/Code39Reader',
        $extends : OneDReader,

        $statics : {
            ALPHABET_STRING : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. *$/+%",
            ALPHABET : [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 45, 46, 32, 42, 36, 47, 43, 37],
            CHARACTER_ENCODINGS : [0x034, 0x121, 0x061, 0x160, 0x031, 0x130, 0x070, 0x025, 0x124, 0x064, 0x109, 0x049, 0x148, 0x019, 0x118, 0x058, 0x00D, 0x10C, 0x04C, 0x01C, 0x103, 0x043, 0x142, 0x013, 0x112, 0x052, 0x007, 0x106, 0x046, 0x016, 0x181, 0x0C1, 0x1C0, 0x091, 0x190, 0x0D0, 0x085, 0x184, 0x0C4, 0x094, 0x0A8, 0x0A2, 0x08A, 0x02A],
            ASTERISK_ENCODING : 0x094
        },

        __usingCheckDigit : false,

        __extendedMode : false,

        __decodeRowResult : null,

        __counters : null,

        initialize : function (usingCheckDigit, extendedMode) {
            this.__usingCheckDigit = (usingCheckDigit === true);
            this.__extendedMode    = (extendedMode === true);
            this.__decodeRowResult = new StringBuilder();
            this.__counters        = new Uint32Array(9);
        },

        decodeRow : function (rowNumber, row, hints) {
            this.__counters = new Uint32Array(9);
            var theCounters = this.__counters;
            this.__decodeRowResult = new StringBuilder();
            var result = this.__decodeRowResult;

            var start = this.__findAsteriskPattern(row, theCounters);

            var nextStart = row.getNextSet(start[1]);
            var end = row.getSize();

            var decodedChar;
            var lastStart;

            do {
                this.$static.recordPattern(row, nextStart, theCounters);
                var pattern = this.__toNarrowWidePattern(theCounters);
                if (pattern < 0) {
                    throw new NotFoundException();
                }
                decodedChar = this.__patternToChar(pattern);
                result.append(String.fromCharCode(decodedChar));
                lastStart = nextStart;
                for (var i = 0; i < theCounters.length; i++) {
                    nextStart += theCounters[i];
                }
                nextStart = row.getNextSet(nextStart);
            } while (decodedChar != '*'.charCodeAt(0));
            result.deleteCharAt(result.length() - 1);

            var lastPatternSize = 0;
            for (var i = 0; i < theCounters.length; i++) {
                lastPatternSize += theCounters[i];
            }
            var whiteSpaceAfterEnd = nextStart - lastStart - lastPatternSize;
            if (nextStart != end && (whiteSpaceAfterEnd * 2) < lastPatternSize) {
                throw new NotFoundException();
            }

            if (this.__usingCheckDigit) {
                var max = result.length() - 1;
                var total = 0;
                for (var i = 0; i < max; i++) {
                    total += this.$static.ALPHABET_STRING.indexOf(this.__decodeRowResult.charAt(i));
                }
                if (result.charCodeAt(max) != this.$static.ALPHABET[total % 43]) {
                    throw new ChecksumException();
                }
                result.setLength(max);
            }

            if (result.length() == 0) {
                throw new NotFoundException();
            }

            var resultString = '';
            if (this.__extendedMode) {
                resultString = this.__decodeExtended(result);
            } else {
                resultString = result.toString();
            }

            var left = (start[1] + start[0]) / 2.0;
            var right = lastStart + lastPatternSize / 2.0;

            return new Result(
                resultString,
                null,
                [new ResultPoint(left, rowNumber), new ResultPoint(right, rowNumber)],
                BarcodeFormat.$static.CODE_39
            );
        },

        __findAsteriskPattern : function (row, counters) {
            var width = row.getSize();
            var rowOffset = row.getNextSet(0);

            var counterPosition = 0;
            var patternStart = rowOffset;
            var isWhite = false;
            var patternLength = counters.length;

            for (var i = rowOffset; i < width; i++) {
                if (row.get(i) ^ isWhite) {
                    counters[counterPosition]++;
                } else {
                    if (counterPosition == patternLength - 1) {
                        if (this.__toNarrowWidePattern(counters) == this.$static.ASTERISK_ENCODING &&
                            row.isRange(Math.max(0, patternStart - Math.floor(((i - patternStart / 2)))), patternStart, false)) {
                            return new Uint32Array([patternStart, i]);
                        }
                        patternStart += counters[0] + counters[1];
                        arrayCopy(counters, 2, counters, 0, patternLength - 2);
                        counters[patternLength - 2] = 0;
                        counters[patternLength - 1] = 0;
                        counterPosition--;
                    } else {
                        counterPosition++;
                    }
                    counters[counterPosition] = 1;
                    isWhite = !isWhite;
                }
            }
            throw new NotFoundException();
        },

        __toNarrowWidePattern : function (counters) {
            var numCounters = counters.length;
            var maxNarrowCounter = 0;
            var wideCounters;
            do {
                var minCounter = Math.pow(2, 31) - 1; // Integer.MAX_VALUE;
                for (var _i = 0; _i < counters.length; _i++) {
                    var counter = counters[_i];
                    if (counter < minCounter && counter > maxNarrowCounter) {
                        minCounter = counter;
                    }
                }
                maxNarrowCounter = minCounter;
                wideCounters = 0;
                var totalWideCountersWidth = 0;
                var pattern = 0;
                for (var i = 0; i < numCounters; i++) {
                    var counter = counters[i];
                    if (counter > maxNarrowCounter) {
                        pattern |= 1 << (numCounters - 1 - i);
                        wideCounters++;
                        totalWideCountersWidth += counter;
                    }
                }
                if (wideCounters === 3) {
                    for (var i = 0; i < numCounters && wideCounters > 0; i++) {
                        var counter = counters[i];
                        if (counter > maxNarrowCounter) {
                            wideCounters--;
                            if ((counter * 2) >= totalWideCountersWidth) {
                                return -1;
                            }
                        }
                    }
                    return pattern;
                }
            } while (wideCounters > 3);
            return -1;
        },

        __patternToChar : function (pattern) {
            for (var i = 0; i < this.$static.CHARACTER_ENCODINGS.length; i++) {
                if (this.$static.CHARACTER_ENCODINGS[i] == pattern) {
                    return this.$static.ALPHABET[i];
                }
            }
            throw new NotFoundException();
        },

        __decodeExtended : function (encoded) {
            var length = encoded.length();
            var decoded = new StringBuilder();
            for (var i = 0; i < length; i++) {
                var c = encoded.charAt(i);
                if (c == '+' || c == '$' || c == '%' || c == '/') {
                    var next = encoded.charCodeAt(i + 1);
                    var decodedChar =  0;
                    switch (c) {
                        case '+':
                            if (next >= 'A'.charCodeAt(0) && next <= 'Z'.charCodeAt(0)) {
                                decodedChar = next + 32;
                            } else {
                                throw new FormatException();
                            }
                            break;
                        case '$':
                            if (next >= 'A'.charCodeAt(0) && next <= 'Z'.charCodeAt(0)) {
                                decodedChar = next - 64;
                            } else {
                                throw new FormatException();
                            }
                            break;
                        case '%':
                            if (next >= 'A'.charCodeAt(0) && next <= 'E'.charCodeAt(0)) {
                                decodedChar = next - 38;
                            } else if (next >= 'F'.charCodeAt(0) && next <= 'W'.charCodeAt(0)) {
                                decodedChar = next - 11;
                            } else {
                                throw new FormatException();
                            }
                            break;
                        case '/':
                            if (next >= 'A'.charCodeAt(0) && next <= 'O'.charCodeAt(0)) {
                                decodedChar = next - 32;
                            } else if (next == 'Z'.charCodeAt(0)) {
                                decodedChar = ':'.charCodeAt(0);
                            } else {
                                throw new FormatException();
                            }
                            break;
                    }
                    decoded.append(String.fromCharCode(decodedChar));
                    i++;
                } else {
                    decoded.append(c);
                }
            }
            return decoded.toString();
        }
    });

    return Code39Reader;
});