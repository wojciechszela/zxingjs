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
    var Code93Reader = Class.declare({
        $name : 'zxing/oned/Code93Reader',
        $extends : OneDReader,

        $statics : {
            ALPHABET_STRING : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%abcd*",
            ALPHABET : [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 45, 46, 32, 36, 47, 43, 37, 97, 98, 99, 100, 42],
            CHARACTER_ENCODINGS : [0x114, 0x148, 0x144, 0x142, 0x128, 0x124, 0x122, 0x150, 0x112, 0x10A, 0x1A8, 0x1A4, 0x1A2, 0x194, 0x192, 0x18A, 0x168, 0x164, 0x162, 0x134, 0x11A, 0x158, 0x14C, 0x146, 0x12C, 0x116, 0x1B4, 0x1B2, 0x1AC, 0x1A6, 0x196, 0x19A, 0x16C, 0x166, 0x136, 0x13A, 0x12E, 0x1D4, 0x1D2, 0x1CA, 0x16E, 0x176, 0x1AE, 0x126, 0x1DA, 0x1D6, 0x132, 0x15E],
            ASTERISK_ENCODING : 0x15E
        },

        __decodeRowResult : null,

        __counters : null,

        initialize : function () {
            this.__decodeRowResult = new StringBuilder();
            this.__counters        = new Uint32Array(6);
        },

        decodeRow : function (rowNumber, row, hints) {
            this.__counters = new Uint32Array(6);
            var theCounters = this.__counters;
            this.__decodeRowResult = new StringBuilder();
            var result = this.__decodeRowResult;

            var start = this.__findAsteriskPattern(row);

            var nextStart = row.getNextSet(start[1]);
            var end = row.getSize();

            var decodedChar;
            var lastStart;

            do {
                this.$static.recordPattern(row, nextStart, theCounters);
                var pattern = this.__toPattern(theCounters);
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
            if (nextStart == end || !row.get(nextStart)) {
                throw new NotFoundException();
            }

            if (result.length() < 2) {
                throw new NotFoundException();
            }

            this.__checkChecksums(result);
            result.setLength(result.length() - 2);

            var resultString = this.__decodeExtended(result);

            var left = (start[1] + start[0]) / 2.0;
            var right = lastStart + lastPatternSize / 2.0;

            return new Result(
                resultString,
                null,
                [new ResultPoint(left, rowNumber), new ResultPoint(right, rowNumber)],
                BarcodeFormat.$static.CODE_93
            );
        },

        __findAsteriskPattern : function (row) {
            var width = row.getSize();
            var rowOffset = row.getNextSet(0);

            this.__counters = new Uint32Array(6);
            var theCounters = this.__counters;
            var patternStart = rowOffset;
            var isWhite = false;
            var patternLength = theCounters.length;

            var counterPosition = 0;
            for (var i = rowOffset; i < width; i++) {
                if (row.get(i) ^ isWhite) {
                    theCounters[counterPosition]++;
                } else {
                    if (counterPosition == patternLength - 1) {
                        if (this.__toPattern(theCounters) == this.$static.ASTERISK_ENCODING) {
                            return new Uint32Array([patternStart, i]);
                        }
                        patternStart += theCounters[0] + theCounters[1];
                        arrayCopy(theCounters, 2, theCounters, 0, patternLength - 2);
                        theCounters[patternLength - 2] = 0;
                        theCounters[patternLength - 1] = 0;
                        counterPosition--;
                    } else {
                        counterPosition++;
                    }
                    theCounters[counterPosition] = 1;
                    isWhite = !isWhite;
                }
            }
            throw new NotFoundException();
        },

        __toPattern : function (counters) {
            var max = counters.length;
            var sum = 0;
            for (var i = 0; i < max; i++) {
                sum += counters[i];
            }
            var pattern = 0;
            for (var i = 0; i < max; i++) {
                var scaled = Math.round(counters[i] * 9.0 / sum);
                if (scaled < 1 || scaled > 4) {
                    return -1;
                }
                if ((i & 0x01) == 0) {
                    for (var j = 0; j < scaled; j++) {
                        pattern = (pattern << 1) | 0x01;
                    }
                } else {
                    pattern = pattern << scaled;
                }
            }
            return pattern;
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
                if (c >= 'a'.charCodeAt(0) && c <= 'd'.charCodeAt(0)) {
                    if (i >= length - 1) {
                        throw FormatException();
                    }
                    var next = encoded.charCodeAt(i + 1);
                    var decodedChar =  0;
                    switch (c) {
                        case 'd':
                            if (next >= 'A'.charCodeAt(0) && next <= 'Z'.charCodeAt(0)) {
                                decodedChar = next + 32;
                            } else {
                                throw new FormatException();
                            }
                            break;
                        case 'a':
                            if (next >= 'A'.charCodeAt(0) && next <= 'Z'.charCodeAt(0)) {
                                decodedChar = next - 64;
                            } else {
                                throw new FormatException();
                            }
                            break;
                        case 'b':
                            if (next >= 'A'.charCodeAt(0) && next <= 'E'.charCodeAt(0)) {
                                decodedChar = next - 38;
                            } else if (next >= 'F'.charCodeAt(0) && next <= 'W'.charCodeAt(0)) {
                                decodedChar = next - 11;
                            } else {
                                throw new FormatException();
                            }
                            break;
                        case 'c':
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
        },

        __checkChecksums : function (result) {
            var length = result.length();
            this.__checkOneChecksum(result, length - 2, 20);
            this.__checkOneChecksum(result, length - 1, 15);
        },

        __checkOneChecksum : function (result, checkPosition, weightMax) {
            var weight = 1;
            var total = 0;
            for (var i = checkPosition - 1; i >= 0; i--) {
                total += weight * this.$static.ALPHABET_STRING.indexOf(result.charAt(i));
                if (++weight > weightMax) {
                    weight = 1;
                }
            }
            if (result.charCodeAt(checkPosition) != this.$static.ALPHABET[total % 47]) {
                throw new ChecksumException();
            }
        }
    });

    return Code93Reader;
});