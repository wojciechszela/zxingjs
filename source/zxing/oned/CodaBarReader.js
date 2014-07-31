define([
    'dejavu/Class',
    'zxing/oned/OneDReader',
    'zxing/DecodeHintType',
    'zxing/Result',
    'zxing/ResultPoint',
    'zxing/BarcodeFormat',
    'zxing/lang/StringBuilder',
    'zxing/lang/arrayCopy',
    'zxing/exception/NotFoundException',
    'mout/array/contains',
    'mout/lang/isObject',
    'mout/object/hasOwn'
], function (Class, OneDReader, DecodeHintType, Result, ResultPoint, BarcodeFormat, StringBuilder, arrayCopy, NotFoundException, contains, isObject, hasOwn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var CodaBarReader = Class.declare({
        $name : 'zxing/oned/CodaBarReader',
        $extends : OneDReader,

        $statics : {
            ALPHABET_STRING : "0123456789-$:/.+ABCD",
            ALPHABET : [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 45, 36, 58, 47, 46, 43, 65, 66, 67, 68],
            CHARACTER_ENCODINGS : [0x003, 0x006, 0x009, 0x060, 0x012, 0x042, 0x021, 0x024, 0x030, 0x048, 0x00C, 0x018, 0x045, 0x051, 0x054, 0x15, 0x1A, 0x029, 0x00B, 0x00E],
            MIN_CHARACTER_LENGTH : 3,
            STARTEND_ENCODINGS : [65, 66, 67, 68]
        },

        __counters : null,

        __counterLength : 0,

        __decodeRowResult : null,

        decodeRow : function (rowNumber, row, hints) {
            this.__counters = new Uint32Array(80);
            this.__setCounters(row);
            var startOffset = this.__findStartPattern();
            var nextStart = startOffset;

            this.__decodeRowResult = new StringBuilder();
            do {
                var charOffset = this.__toNarrowWidePattern(nextStart);
                if (charOffset === -1) {
                    throw new NotFoundException();
                }

                this.__decodeRowResult.append(String.fromCharCode(charOffset));
                nextStart += 8;

                if (this.__decodeRowResult.length() > 1 && contains(this.$static.STARTEND_ENCODINGS, this.$static.ALPHABET[charOffset])) {
                    break;
                }
            } while(nextStart < this.__counterLength);

            var trailingWhitespace = this.__counters[nextStart - 1];
            var lastPatternSize = 0;
            for (var i = -8; i < -1; i++) {
                lastPatternSize += this.__counters[nextStart + i];
            }

            if (nextStart < this.__counterLength && trailingWhitespace < Math.floor(lastPatternSize / 2)) {
                throw new NotFoundException();
            }

            this.validatePattern(startOffset);

            for (var i = 0; i < this.__decodeRowResult.length(); i++) {
                this.__decodeRowResult.setCharAt(i, String.fromCharCode(this.$static.ALPHABET[this.__decodeRowResult.charCodeAt(i)]));
            }

            var startchar = this.__decodeRowResult.charCodeAt(0);

            if (!contains(this.$static.STARTEND_ENCODINGS, startchar)) {
                throw new NotFoundException();
            }

            if (this.__decodeRowResult.length() <= this.$static.MIN_CHARACTER_LENGTH) {
                throw new NotFoundException();
            }

            if (!isObject(hints) || !hasOwn(hints, DecodeHintType.$static.RETURN_CODABAR_START_END)) {
                this.__decodeRowResult.deleteCharAt(this.__decodeRowResult.length() - 1);
                this.__decodeRowResult.deleteCharAt(0);
            }

            var runningCount = 0;
            for (var i = 0; i < startOffset; i++) {
                runningCount += this.__counters[i];
            }
            var left = runningCount;
            for (i = startOffset; i < nextStart - 1; i++) {
                runningCount += this.__counters[i];
            }
            var right = runningCount;
            return new Result(
                this.__decodeRowResult.toString(),
                null,
                [new ResultPoint(left, rowNumber), new ResultPoint(right, rowNumber)],
                BarcodeFormat.$static.CODABAR
            );
        },

        validatePattern : function (start) {
            var sizes = new Uint32Array([0, 0, 0, 0]);
            var counts = new Uint32Array([0, 0, 0, 0]);
            var end = this.__decodeRowResult.length() - 1;

            var pos = start;

            for (var i = 0; true; i++) {
                var pattern = this.$static.CHARACTER_ENCODINGS[this.__decodeRowResult.charAt(i)];
                for (var j = 6; j >= 0; j--) {
                    var category = (j & 1) + (pattern & 1) * 2;
                    sizes[category] += this.__counters[pos + j];
                    counts[category]++;
                    pattern = pattern >> 1;
                }
                if (i >= end) {
                    break;
                }

                pos += 8;
            }

            var maxes = new Float32Array(4);
            var mins = new Float32Array(4);

            for (i = 0; i < 2; i++) {
                mins[i] = 0.0;
                mins[i + 2] = (sizes[i] / counts[i] + sizes[i + 2] / counts[i + 2]) / 2.0;
                maxes[i] = mins[i + 2];
                maxes[i + 2] = (sizes[i + 2] * this.$static.MAX_ACCEPTABLE + this.$static.PADDING) / counts[i + 2];
            }

            pos = start;

            for (i = 0; true; i++) {
                pattern = this.$static.CHARACTER_ENCODINGS[this.__decodeRowResult.charAt(i)];
                for (j = 6; j >= 0; j--) {
                    category = (j & 1) + (pattern & 1) * 2;
                    var size = this.__counters[pos + j];
                    if (size < mins[category] || size > maxes[category]) {
                        throw new NotFoundException();
                    }
                    pattern = pattern >> 1;
                }
                if (i >= end) {
                    break;
                }
                pos += 8;
            }
        },

        __setCounters : function (row) {
            this.__counterLength = 0;
            var i = row.getNextUnset(0);
            var end = row.getSize();
            if (i >= end) {
                throw new NotFoundException();
            }
            var isWhite = true;
            var count = 0;
            while (i < end) {
                if (row.get(i) ^ isWhite) {
                    count++;
                } else {
                    this.__counterAppend(count);
                    count = 1;
                    isWhite = !isWhite;
                }
                i++;
            }
            this.__counterAppend(count);
        },

        __counterAppend : function (e) {
            this.__counters[this.__counterLength] = e;
            this.__counterLength++;
            if (this.__counterLength >= this.__counters.length) {
                var temp = new Uint32Array(this.__counterLength * 2);
                arrayCopy(this.__counters, 0, temp, 0, this.__counterLength);
                this.__counters = temp;
            }
        },

        __findStartPattern : function () {
            for (var i = 1; i < this.__counterLength; i += 2) {
                var charOffset = this.__toNarrowWidePattern(i);
                if (charOffset !== -1 && contains(this.$static.STARTEND_ENCODINGS, this.$static.ALPHABET[charOffset])) {
                    var patternSize = 0;
                    for (var j = i; j < i + 7; j++) {
                        patternSize += this.__counters[j];
                    }
                    if (i == 1 || this.__counters[i - 1] >= patternSize / 2) {
                        return i;
                    }
                }
            }

            throw new NotFoundException();
        },

        __toNarrowWidePattern : function (position) {
            var end = position + 7;
            if (end >= this.__counterLength) {
                return -1;
            }

            var theCounters = this.__counters;

            var maxBar = 0;
            var minBar = Math.pow(2, 31) - 1; // Integer.MAX_VALUE;
            for (var j = position; j < end; j += 2) {
                var currentCounter = theCounters[j];
                if (currentCounter < minBar) {
                    minBar = currentCounter;
                }
                if (currentCounter > maxBar) {
                    maxBar = currentCounter;
                }
            }
            var thresholdBar = Math.floor((minBar + maxBar) / 2);

            var maxSpace = 0;
            var minSpace = Math.pow(2, 31) - 1; // Integer.MAX_VALUE;
            for (var j = position + 1; j < end; j += 2) {
                var currentCounter = theCounters[j];
                if (currentCounter < minSpace) {
                    minSpace = currentCounter;
                }
                if (currentCounter > maxSpace) {
                    maxSpace = currentCounter;
                }
            }
            var thresholdSpace = Math.floor((minSpace + maxSpace) / 2);

            var bitmask = 1 << 7;
            var pattern = 0;
            for (var i = 0; i < 7; i++) {
                var threshold = (i & 1) == 0 ? thresholdBar : thresholdSpace;
                bitmask = bitmask >> 1;
                if (theCounters[position + i] > threshold) {
                    pattern |= bitmask;
                }
            }

            for (i = 0; i < this.$static.CHARACTER_ENCODINGS.length; i++) {
                if (this.$static.CHARACTER_ENCODINGS[i] == pattern) {
                    return i;
                }
            }

            return -1;
        }
    });

    return CodaBarReader;
});