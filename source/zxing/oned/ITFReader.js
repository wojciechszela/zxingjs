define([
    'dejavu/Class',
    'zxing/oned/OneDReader',
    'zxing/Result',
    'zxing/ResultPoint',
    'zxing/BarcodeFormat',
    'zxing/DecodeHintType',
    'zxing/exception/NotFoundException',
    'zxing/exception/FormatException',
    'zxing/lang/StringBuilder',
    'zxing/lang/arrayCopy',
    'mout/lang/isObject',
    'mout/object/hasOwn'
], function (Class, OneDReader, Result, ResultPoint, BarcodeFormat, DecodeHintType, NotFoundException, FormatException, StringBuilder, arrayCopy, isObject, hasOwn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var ITFReader = Class.declare({
        $name : 'zxing/oned/ITFReader',
        $extends : OneDReader,

        $statics : {
            MAX_AVG_VARIANCE : 0.38,
            MAX_INDIVIDUAL_VARIANCE : 0.78,
            W : 3,
            N : 1,
            DEFAULT_ALLOWED_LENGTHS : new Uint32Array([6, 8, 10, 12, 14]),
            START_PATTERN : new Uint32Array([1, 1, 1, 1]),
            END_PATTERN_REVERSED : new Uint32Array([1, 1, 3]),
            PATTERNS : [
                new Uint32Array([1, 1, 3, 3, 1]),
                new Uint32Array([3, 1, 1, 1, 3]),
                new Uint32Array([1, 3, 1, 1, 3]),
                new Uint32Array([3, 3, 1, 1, 1]),
                new Uint32Array([1, 1, 3, 1, 3]),
                new Uint32Array([3, 1, 3, 1, 1]),
                new Uint32Array([1, 3, 3, 1, 1]),
                new Uint32Array([1, 1, 1, 3, 3]),
                new Uint32Array([3, 1, 1, 3, 1]),
                new Uint32Array([1, 3, 1, 3, 1])
            ]
        },

        __narrowLineWidth : -1,

        decodeRow : function (rowNumber, row, hints) {
            var startRange = this.decodeStart(row);
            var endRange  = this.decodeEnd(row);

            var result = new StringBuilder();
            this.__decodeMiddle(row, startRange[1], endRange[0], result);
            var resultString = result.toString();

            var allowedLengths = null;

            if (isObject(hints) && hasOwn(hints, DecodeHintType.$static.ALLOWED_LENGTHS)) {
                allowedLengths = new Uint32Array(hints[DecodeHintType.$static.ALLOWED_LENGTHS]);
            }

            if (allowedLengths === null) {
                allowedLengths = this.$static.DEFAULT_ALLOWED_LENGTHS;
            }

            var length = resultString.length;
            var lengthOK = false;
            var maxAllowedLength = 0;

            for (var i = 0; i < allowedLengths.length; i++) {
                var allowedLength = allowedLengths[i];
                if (length == allowedLength) {
                    lengthOK = true;
                    break;
                }
                if (allowedLength > maxAllowedLength) {
                    maxAllowedLength = allowedLength;
                }
            }
            if (!lengthOK && length > maxAllowedLength) {
                lengthOK = true;
            }
            if (!lengthOK) {
                throw new FormatException();
            }

            return new Result(
                resultString,
                null,
                [new ResultPoint(startRange[1], rowNumber), new ResultPoint(endRange[0], rowNumber)],
                BarcodeFormat.$static.ITF
            );
        },

        __decodeMiddle : function (row, payloadStart, payloadEnd, resultString) {
            var counterDigitPair = new Uint32Array(10);
            var counterBlack = new Uint32Array(5);
            var counterWhite = new Uint32Array(5);

            while (payloadStart < payloadEnd) {
                this.$static.recordPattern(row, payloadStart, counterDigitPair);
                for (var k = 0; k < 5; k++) {
                    var twoK = 2 * k;
                    counterBlack[k] = counterDigitPair[twoK];
                    counterWhite[k] = counterDigitPair[twoK + 1];
                }

                var bestMatch = this.__decodeDigit(counterBlack);
                resultString.append(String.fromCharCode('0'.charCodeAt(0) + bestMatch));
                bestMatch = this.__decodeDigit(counterWhite);
                resultString.append(String.fromCharCode('0'.charCodeAt(0) + bestMatch));

                for (var i = 0; i < counterDigitPair.length; i++) {
                    payloadStart += counterDigitPair[i];
                }
            }
        },

        decodeStart : function (row) {
            var endStart = this.__skipWhiteSpace(row);
            var startPattern = this.__findGuardPattern(row, endStart, this.$static.START_PATTERN);

            this.__narrowLineWidth = Math.floor((startPattern[1] - startPattern[0]) / 4);
            this.__validateQuietZone(row, startPattern[0]);

            return startPattern;
        },

        __validateQuietZone : function (row, startPattern) {
            var quietCount = quietCount < startPattern ? quietCount : startPattern;

            for (var i = startPattern - 1; quietCount > 0 && i >= 0; i--) {
                if (row.get(i)) {
                    break;
                }
                quietCount--;
            }
            if (quietCount != 0) {
                throw new NotFoundException();
            }
        },

        __skipWhiteSpace : function (row) {
            var width = row.getSize();
            var endStart = row.getNextSet(0);
            if (endStart == width) {
                throw new NotFoundException();
            }

            return endStart;
        },

        decodeEnd : function (row) {
            row.reverse();
            try {
                var endStart = this.__skipWhiteSpace(row);
                var endPattern = this.__findGuardPattern(row, endStart, this.$static.END_PATTERN_REVERSED);

                this.__validateQuietZone(row, endPattern[0]);

                var temp = endPattern[0];
                endPattern[0] = row.getSize() - endPattern[1];
                endPattern[1] = row.getSize() - temp;

                return endPattern;
            } finally {
                row.reverse();
            }
        },

        __findGuardPattern : function(row, rowOffset, pattern) {
            var patternLength = pattern.length;
            var counters = new Uint32Array(patternLength);
            var width = row.getSize();
            var isWhite = false;

            var counterPosition = 0;
            var patternStart = rowOffset;
            for (var x = rowOffset; x < width; x++) {
                if (row.get(x) ^ isWhite) {
                    counters[counterPosition]++;
                } else {
                    if (counterPosition == patternLength - 1) {
                        if (this.$static.patternMatchVariance(counters, pattern, this.$static.MAX_INDIVIDUAL_VARIANCE) < this.$static.MAX_AVG_VARIANCE) {
                            return new Uint32Array([patternStart, x]);
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

        __decodeDigit : function (counters) {
            var bestVariance = this.$static.MAX_AVG_VARIANCE;
            var bestMatch = -1;
            var max = this.$static.PATTERNS.length;
            for (var i = 0; i < max; i++) {
                var pattern = this.$static.PATTERNS[i];
                var variance = this.$static.patternMatchVariance(counters, pattern, this.$static.MAX_INDIVIDUAL_VARIANCE);
                if (variance < bestVariance) {
                    bestVariance = variance;
                    bestMatch = i;
                }
            }
            if (bestMatch >= 0) {
                return bestMatch;
            } else {
                throw new NotFoundException();
            }
        }
    });

    return ITFReader;
});