define([
    'dejavu/FinalClass',
    'zxing/oned/OneDReader',
    'zxing/exception/NotFoundException',
    'zxing/lang/arrayCopy'
], function (FinalClass, OneDReader, NotFoundException, arrayCopy) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var UPCEANHelper = FinalClass.declare({
        $name : 'zxing/oned/UPCEANHelper',

        $finals : {
            $statics : {
                MAX_AVG_VARIANCE : 0.48,
                MAX_INDIVIDUAL_VARIANCE : 0.7,

                START_END_PATTERN : [1, 1, 1],

                MIDDLE_PATTERN : [1, 1, 1, 1, 1],

                L_PATTERNS : [
                    [3, 2, 1, 1], // 0
                    [2, 2, 2, 1],
                    [2, 1, 2, 2],
                    [1, 4, 1, 1],
                    [1, 1, 3, 2],
                    [1, 2, 3, 1],
                    [1, 1, 1, 4],
                    [1, 3, 1, 2],
                    [1, 2, 1, 3],
                    [3, 1, 1, 2]
                ],
                L_AND_G_PATTERNS : [
                    [3, 2, 1, 1],
                    [2, 2, 2, 1],
                    [2, 1, 2, 2],
                    [1, 4, 1, 1],
                    [1, 1, 3, 2],
                    [1, 2, 3, 1],
                    [1, 1, 1, 4],
                    [1, 3, 1, 2],
                    [1, 2, 1, 3],
                    [3, 1, 1, 2],
                    [1, 1, 2, 3],
                    [1, 2, 2, 2],
                    [2, 2, 1, 2],
                    [1, 1, 4, 1],
                    [2, 3, 1, 1],
                    [1, 3, 2, 1],
                    [4, 1, 1, 1],
                    [2, 1, 3, 1],
                    [3, 1, 2, 1],
                    [2, 1, 1, 3]
                ]
            }
        },

        $statics : {
            findGuardPattern : function (row, rowOffset, whiteFirst, pattern, counters) {
                if (arguments.length < 5) {
                    counters = new Uint32Array(pattern.length);
                }

                var patternLength = pattern.length;
                var width = row.getSize();
                var isWhite = whiteFirst;
                rowOffset = whiteFirst ? row.getNextUnset(rowOffset) : row.getNextSet(rowOffset);
                var counterPosition = 0;
                var patternStart = rowOffset;
                for (var x = rowOffset; x < width; x++) {
                    if (row.get(x) ^ isWhite) {
                        counters[counterPosition]++;
                    } else {
                        if (counterPosition === patternLength - 1) {
                            if (OneDReader.$static.patternMatchVariance(counters, pattern, this.$static.MAX_INDIVIDUAL_VARIANCE) < this.$static.MAX_AVG_VARIANCE) {
                                return new Uint32Array([patternStart, x]);
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

            findStartGuardPattern : function (row) {
                var foundStart = false;
                var startRange = null;
                var nextStart  = 0;
                var counters   = new Uint32Array(this.$static.START_END_PATTERN.length);

                while (!foundStart) {
                    for (var _i = 0; _i < this.$static.START_END_PATTERN.length; _i++) {
                        counters[_i] = 0;
                    }
                    startRange = this.$static.findGuardPattern(row, nextStart, false, this.$static.START_END_PATTERN, counters);
                    var start = startRange[0];
                    nextStart = startRange[1];
                    var quietStart = start - (nextStart - start);
                    if (quietStart >= 0) {
                        foundStart = row.isRange(quietStart, start, false);
                    }
                }

                return startRange;
            },

            decodeDigit : function (row, counters, rowOffset, patterns) {
                OneDReader.$static.recordPattern(row, rowOffset, counters);
                var bestVariance = this.$static.MAX_AVG_VARIANCE;
                var bestMatch = -1;
                var max = patterns.length;

                for (var i = 0; i < max; i++) {
                    var pattern = patterns[i];
                    var variance = OneDReader.$static.patternMatchVariance(counters, pattern, this.$static.MAX_INDIVIDUAL_VARIANCE);
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
        }
    });

    return UPCEANHelper;
});