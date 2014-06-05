define([
    'dejavu/Class',
    'zxing/DecodeHintType',
    'zxing/Result',
    'zxing/ResultPoint',
    'zxing/BarcodeFormat',
    'zxing/oned/OneDReader',
    'zxing/exception/NotFoundException',
    'zxing/exception/FormatException',
    'zxing/exception/ChecksumException',
    'zxing/lang/StringBuilder',
    'zxing/lang/arrayCopy',
    'mout/lang/isObject',
    'mout/object/hasOwn'
], function (Class, DecodeHintType, Result, ResultPoint, BarcodeFormat, OneDReader, NotFoundException, FormatException, ChecksumException, StringBuilder, arrayCopy, isObject, hasOwn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Code128Reader = Class.declare({
        $name : 'zxing/oned/Code128Reader',
        $extends : OneDReader,

        $finals : {
            $statics : {
                CODE_PATTERNS : [
                    [2, 1, 2, 2, 2, 2], // 0
                    [2, 2, 2, 1, 2, 2],
                    [2, 2, 2, 2, 2, 1],
                    [1, 2, 1, 2, 2, 3],
                    [1, 2, 1, 3, 2, 2],
                    [1, 3, 1, 2, 2, 2], // 5
                    [1, 2, 2, 2, 1, 3],
                    [1, 2, 2, 3, 1, 2],
                    [1, 3, 2, 2, 1, 2],
                    [2, 2, 1, 2, 1, 3],
                    [2, 2, 1, 3, 1, 2], // 10
                    [2, 3, 1, 2, 1, 2],
                    [1, 1, 2, 2, 3, 2],
                    [1, 2, 2, 1, 3, 2],
                    [1, 2, 2, 2, 3, 1],
                    [1, 1, 3, 2, 2, 2], // 15
                    [1, 2, 3, 1, 2, 2],
                    [1, 2, 3, 2, 2, 1],
                    [2, 2, 3, 2, 1, 1],
                    [2, 2, 1, 1, 3, 2],
                    [2, 2, 1, 2, 3, 1], // 20
                    [2, 1, 3, 2, 1, 2],
                    [2, 2, 3, 1, 1, 2],
                    [3, 1, 2, 1, 3, 1],
                    [3, 1, 1, 2, 2, 2],
                    [3, 2, 1, 1, 2, 2], // 25
                    [3, 2, 1, 2, 2, 1],
                    [3, 1, 2, 2, 1, 2],
                    [3, 2, 2, 1, 1, 2],
                    [3, 2, 2, 2, 1, 1],
                    [2, 1, 2, 1, 2, 3], // 30
                    [2, 1, 2, 3, 2, 1],
                    [2, 3, 2, 1, 2, 1],
                    [1, 1, 1, 3, 2, 3],
                    [1, 3, 1, 1, 2, 3],
                    [1, 3, 1, 3, 2, 1], // 35
                    [1, 1, 2, 3, 1, 3],
                    [1, 3, 2, 1, 1, 3],
                    [1, 3, 2, 3, 1, 1],
                    [2, 1, 1, 3, 1, 3],
                    [2, 3, 1, 1, 1, 3], // 40
                    [2, 3, 1, 3, 1, 1],
                    [1, 1, 2, 1, 3, 3],
                    [1, 1, 2, 3, 3, 1],
                    [1, 3, 2, 1, 3, 1],
                    [1, 1, 3, 1, 2, 3], // 45
                    [1, 1, 3, 3, 2, 1],
                    [1, 3, 3, 1, 2, 1],
                    [3, 1, 3, 1, 2, 1],
                    [2, 1, 1, 3, 3, 1],
                    [2, 3, 1, 1, 3, 1], // 50
                    [2, 1, 3, 1, 1, 3],
                    [2, 1, 3, 3, 1, 1],
                    [2, 1, 3, 1, 3, 1],
                    [3, 1, 1, 1, 2, 3],
                    [3, 1, 1, 3, 2, 1], // 55
                    [3, 3, 1, 1, 2, 1],
                    [3, 1, 2, 1, 1, 3],
                    [3, 1, 2, 3, 1, 1],
                    [3, 3, 2, 1, 1, 1],
                    [3, 1, 4, 1, 1, 1], // 60
                    [2, 2, 1, 4, 1, 1],
                    [4, 3, 1, 1, 1, 1],
                    [1, 1, 1, 2, 2, 4],
                    [1, 1, 1, 4, 2, 2],
                    [1, 2, 1, 1, 2, 4], // 65
                    [1, 2, 1, 4, 2, 1],
                    [1, 4, 1, 1, 2, 2],
                    [1, 4, 1, 2, 2, 1],
                    [1, 1, 2, 2, 1, 4],
                    [1, 1, 2, 4, 1, 2], // 70
                    [1, 2, 2, 1, 1, 4],
                    [1, 2, 2, 4, 1, 1],
                    [1, 4, 2, 1, 1, 2],
                    [1, 4, 2, 2, 1, 1],
                    [2, 4, 1, 2, 1, 1], // 75
                    [2, 2, 1, 1, 1, 4],
                    [4, 1, 3, 1, 1, 1],
                    [2, 4, 1, 1, 1, 2],
                    [1, 3, 4, 1, 1, 1],
                    [1, 1, 1, 2, 4, 2], // 80
                    [1, 2, 1, 1, 4, 2],
                    [1, 2, 1, 2, 4, 1],
                    [1, 1, 4, 2, 1, 2],
                    [1, 2, 4, 1, 1, 2],
                    [1, 2, 4, 2, 1, 1], // 85
                    [4, 1, 1, 2, 1, 2],
                    [4, 2, 1, 1, 1, 2],
                    [4, 2, 1, 2, 1, 1],
                    [2, 1, 2, 1, 4, 1],
                    [2, 1, 4, 1, 2, 1], // 90
                    [4, 1, 2, 1, 2, 1],
                    [1, 1, 1, 1, 4, 3],
                    [1, 1, 1, 3, 4, 1],
                    [1, 3, 1, 1, 4, 1],
                    [1, 1, 4, 1, 1, 3], // 95
                    [1, 1, 4, 3, 1, 1],
                    [4, 1, 1, 1, 1, 3],
                    [4, 1, 1, 3, 1, 1],
                    [1, 1, 3, 1, 4, 1],
                    [1, 1, 4, 1, 3, 1], // 100
                    [3, 1, 1, 1, 4, 1],
                    [4, 1, 1, 1, 3, 1],
                    [2, 1, 1, 4, 1, 2],
                    [2, 1, 1, 2, 1, 4],
                    [2, 1, 1, 2, 3, 2], // 105
                    [2, 3, 3, 1, 1, 1, 2]
                ],
                MAX_AVG_VARIANCE : 0.25,
                MAX_INDIVIDUAL_VARIANCE : 0.7,

                CODE_SHIFT : 98,
                CODE_CODE_C : 99,
                CODE_CODE_B : 100,
                CODE_CODE_A : 101,

                CODE_FNC_1 : 102,
                CODE_FNC_2 : 97,
                CODE_FNC_3 : 96,
                CODE_FNC_4_A : 101,
                CODE_FNC_4_B : 100,

                CODE_START_A : 103,
                CODE_START_B : 104,
                CODE_START_C : 105,
                CODE_STOP    : 106
            }
        },

        __findStartPattern : function (row) {
            var width = row.getSize();
            var rowOffset = row.getNextSet(0);

            var counterPosition = 0;
            var counters = new Uint32Array(6);
            var patternStart = rowOffset;
            var isWhite = false;
            var patternLength = counters.length;

            for (var i = rowOffset; i < width; i++) {
                if (row.get(i) ^ isWhite) {
                    counters[counterPosition]++;
                } else {
                    if (counterPosition === patternLength - 1) {
                        var bestVariance = this.$static.MAX_AVG_VARIANCE;
                        var bestMatch = -1;
                        for (var startCode = this.$static.CODE_START_A; startCode <= this.$static.CODE_START_C; startCode++) {
                            var variance = this.$static.patternMatchVariance(counters, this.$static.CODE_PATTERNS[startCode], this.$static.MAX_INDIVIDUAL_VARIANCE);
                            if (variance < bestVariance) {
                                bestVariance = variance;
                                bestMatch = startCode;
                            }
                        }

                        if (bestMatch >= 0 && row.isRange(Math.max(0, patternStart - Math.floor((i - patternStart) / 2)), patternStart, false)) {
                            return [patternStart, i, bestMatch];
                        }
                        patternStart += counters[0] + counters[1];
                        counters = arrayCopy(counters, 2, counters, 0, patternLength - 2);
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

        __decodeCode : function (row, counters, rowOffset) {
            this.$static.recordPattern(row, rowOffset, counters);
            var bestVariance = this.$static.MAX_AVG_VARIANCE;
            var bestMatch = -1;

            for (var d = 0; d < this.$static.CODE_PATTERNS.length; d++) {
                var pattern = this.$static.CODE_PATTERNS[d];
                var variance = this.$static.patternMatchVariance(counters, pattern, this.$static.MAX_INDIVIDUAL_VARIANCE);

                if (variance < bestVariance) {
                    bestVariance = variance;
                    bestMatch = d;
                }
            }

            if (bestMatch >= 0) {
                return bestMatch;
            } else {
                throw new NotFoundException();
            }
        },

        decodeRow : function (rowNumber, row, hints) {
            var convertFNC1 = isObject(hints) && hasOwn(hints, DecodeHintType.$static.ASSUME_GS1);

            var startPatternInfo = this.__findStartPattern(row);

            var startCode = startPatternInfo[2];

            var rawCodes = new Array();
            rawCodes.push(startCode);

            var codeSet = null;

            switch (startCode) {
                case this.$static.CODE_START_A:
                    codeSet = this.$static.CODE_CODE_A;
                    break;
                case this.$static.CODE_START_B:
                    codeSet = this.$static.CODE_CODE_B;
                    break;
                case this.$static.CODE_START_C:
                    codeSet = this.$static.CODE_CODE_C;
                    break;
                default:
                    throw new FormatException();
            }

            var done = false;
            var isNextShifted = false;

            var result = new StringBuilder();

            var lastStart = startPatternInfo[0];
            var nextStart = startPatternInfo[1];
            var counters  = new Uint32Array(6);

            var lastCode = 0;
            var code = 0;
            var checksumTotal = startCode;
            var multiplier = 0;
            var lastCharacterWasPrintable = true;
            var upperMode = false;
            var shiftUpperMode = false;

            while (!done) {
                var unshift = isNextShifted;
                isNextShifted = false;

                lastCode = code;

                code = this.__decodeCode(row, counters, nextStart);

                rawCodes.push(code);

                if (code !== this.$static.CODE_STOP) {
                    lastCharacterWasPrintable = true;
                }

                if (code !== this.$static.CODE_STOP) {
                    multiplier++;
                    checksumTotal += multiplier * code;
                }

                lastStart = nextStart;
                for (var _i = 0; _i < counters.length; _i++) {
                    nextStart += counters[_i];
                }

                switch (code) {
                    case this.$static.CODE_START_A:
                    case this.$static.CODE_START_B:
                    case this.$static.CODE_START_C:
                        throw new FormatException();
                }

                switch (codeSet) {
                    case this.$static.CODE_CODE_A:
                        if (code < 64) {
                            if (shiftUpperMode === upperMode) {
                                result.append(String.fromCharCode(32 + code));
                            } else {
                                result.append(String.fromCharCode(32 + code + 128));
                            }
                            shiftUpperMode = false;
                        } else if (code < 96) {
                            if (shiftUpperMode === upperMode) {
                                result.append(String.fromCharCode(code - 64));
                            } else {
                                result.append(String.fromCharCode(code + 64));
                            }
                            shiftUpperMode = false;
                        } else {
                            if (code !== this.$static.CODE_STOP) {
                                lastCharacterWasPrintable = false;
                            }
                            switch (code) {
                                case this.$static.CODE_FNC_1:
                                    if (result.length() === 0) {
                                        result.append(']C1');
                                    } else {
                                        result.append(String.fromCharCode(29));
                                    }
                                    break;
                                case this.$static.CODE_FNC_2:
                                case this.$static.CODE_FNC_3:
                                    break;
                                case this.$static.CODE_FNC_4_A:
                                    if (!upperMode && shiftUpperMode) {
                                        upperMode = true;
                                        shiftUpperMode = false;
                                    } else if (upperMode && shiftUpperMode) {
                                        upperMode = false;
                                        shiftUpperMode = false;
                                    } else {
                                        shiftUpperMode = true;
                                    }
                                    break;
                                case this.$static.CODE_SHIFT:
                                    isNextShifted = true;
                                    codeSet = this.$static.CODE_CODE_B;
                                    break;
                                case this.$static.CODE_CODE_B:
                                    codeSet = this.$static.CODE_CODE_B;
                                    break;
                                case this.$static.CODE_CODE_C:
                                    codeSet = this.$static.CODE_CODE_C;
                                    break;
                                case this.$static.CODE_STOP:
                                    done = true;
                                    break;
                            }
                        }
                        break;
                    case this.$static.CODE_CODE_B:
                        if (code < 96) {
                            if (shiftUpperMode === upperMode) {
                                result.append(String.fromCharCode(32 + code));
                            } else {
                                result.append(String.fromCharCode(32 + code + 128));
                            }
                            shiftUpperMode = false;
                        } else {
                            if (code !== this.$static.CODE_STOP) {
                                lastCharacterWasPrintable = false;
                            }
                            switch (code) {
                                case this.$static.CODE_FNC_1:
                                    if (convertFNC1) {
                                        if (result.length() === 0) {
                                            result.append(']C1');
                                        } else {
                                            result.append(String.fromCharCode(29));
                                        }
                                    }
                                    break;
                                case this.$static.CODE_FNC_2:
                                case this.$static.CODE_FNC_3:
                                    break;
                                case this.$static.CODE_FNC_4_B:
                                    if (!upperMode && shiftUpperMode) {
                                        upperMode = true;
                                        shiftUpperMode = false;
                                    } else if (upperMode && shiftUpperMode) {
                                        upperMode = false;
                                        shiftUpperMode = false;
                                    } else {
                                        shiftUpperMode = true;
                                    }
                                    break;
                                case this.$static.CODE_SHIFT:
                                    isNextShifted = true;
                                    codeSet = this.$static.CODE_CODE_A;
                                    break;
                                case this.$static.CODE_CODE_A:
                                    codeSet = this.$static.CODE_CODE_A;
                                    break;
                                case this.$static.CODE_CODE_C:
                                    codeSet = this.$static.CODE_CODE_C;
                                    break;
                                case this.$static.CODE_STOP:
                                    done = true;
                                    break;
                            }
                        }
                        break;
                    case this.$static.CODE_CODE_C:
                        if (code < 100) {
                            if (code < 10) {
                                result.append('0');
                            }
                            result.append(code);
                        } else {
                            if (code !== this.$static.CODE_STOP) {
                                lastCharacterWasPrintable = false;
                            }
                            switch (code) {
                                case this.$static.CODE_FNC_1:
                                    if (convertFNC1) {
                                        if (result.length() === 0) {
                                            result.append(']C1');
                                        } else {
                                            result.append(String.fromCharCode(29));
                                        }
                                    }
                                    break;
                                case this.$static.CODE_CODE_A:
                                    codeSet = this.$static.CODE_CODE_A;
                                    break;
                                case this.$static.CODE_CODE_B:
                                    codeSet = this.$static.CODE_CODE_B;
                                    break;
                                case this.$static.CODE_STOP:
                                    done = true;
                                    break;
                            }
                        }
                        break;
                }

                if (unshift) {
                    codeSet = codeSet === this.$static.CODE_CODE_A ? this.$static.CODE_CODE_B : this.$static.CODE_CODE_A;
                }
            }

            var lastPatternSize = nextStart - lastStart;

            nextStart = row.getNextUnset(nextStart);

            if (!row.isRange(nextStart, Math.min(row.getSize(), nextStart + Math.floor((nextStart - lastStart) / 2)), false)) {
                throw new NotFoundException();
            }

            checksumTotal -= multiplier * lastCode;
            if (checksumTotal % 103 !== lastCode) {
                throw new ChecksumException();
            }

            var resultLength = result.length();

            if (resultLength === 0) {
                throw new NotFoundException();
            }


            if (resultLength > 0 && lastCharacterWasPrintable) {
                if (codeSet === this.$static.CODE_CODE_C) {
                    result.del(0, resultLength - 2);
                } else {
                    result.del(0, resultLength - 1);
                }
            }

            var left = (startPatternInfo[1] + startPatternInfo[0] + 0.0) / 2.0;
            var right = lastStart + (lastPatternSize + 0.0) / 2.0;

            var rawCodeSize = rawCodes.length;
            var rawBytes = new Uint8Array(rawCodeSize);
            for (var _i = 0; _i < rawCodeSize; _i++) {
                rawBytes[_i] = rawCodes[_i];
            }

            return new Result(
                result.toString(),
                rawBytes,
                [new ResultPoint(left, rowNumber), new ResultPoint(right, rowNumber)],
                BarcodeFormat.$static.CODE_128
            );
        }
    });

    return Code128Reader;
});