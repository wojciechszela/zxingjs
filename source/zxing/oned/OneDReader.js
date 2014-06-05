define([
    'dejavu/AbstractClass',
    'zxing/Reader',
    'zxing/DecodeHintType',
    'zxing/ResultMetadataType',
    'zxing/ResultPoint',
    'zxing/common/BitArray',
    'zxing/exception/NotFoundException',
    'mout/lang/isObject',
    'mout/lang/isArray',
    'mout/object/hasOwn'
], function (AbstractClass, Reader, DecodeHintType, ResultMetadataType, ResultPoint, BitArray, NotFoundException, isObject, isArray, hasOwn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var OneDReader = AbstractClass.declare({
        $name       : 'zxing/oned/OneDReader',
        $implements : [Reader],

        $statics : {
            patternMatchVariance : function (counters, pattern, maxIndividualVariance) {
                var numCounters = counters.length;
                var total = 0;
                var patternLength = 0;
                for (var i = 0; i < numCounters; i++) {
                    total += counters[i];
                    patternLength += pattern[i];
                }
                if (total < patternLength) {
                    return Number.POSITIVE_INFINITY;
                }

                var unitBarWidth = total / patternLength * 1.0;
                maxIndividualVariance *= unitBarWidth;

                var totalVariance = 0.0;
                for (var x = 0; x < numCounters; x++) {
                    var counter = counters[x];
                    var scaledPattern = pattern[x] * unitBarWidth;
                    var variance = counter > scaledPattern ? counter - scaledPattern : scaledPattern - counter;
                    if (variance > maxIndividualVariance) {
                        return Number.POSITIVE_INFINITY;
                    }
                    totalVariance += variance;
                }

                return totalVariance / total * 1.0;
            },

            recordPattern : function (row, start, counters) {
                var numCounters = counters.length;
                // Array.fill
                for (var _i = 0; _i < numCounters; _i++) {
                    counters[_i] = 0;
                }
                var end = row.getSize();

                if (start >= end) {
                    throw new NotFoundException();
                }
                var isWhite = !row.get(start);
                var counterPosition = 0;
                var i = start;

                while (i < end) {
                    if (row.get(i) ^ isWhite) {
                        counters[counterPosition]++;
                    } else {
                        counterPosition++;
                        if (counterPosition === numCounters) {
                            break;
                        } else {
                            counters[counterPosition] = 1;
                            isWhite = !isWhite;
                        }
                    }
                    i++;
                }

                if (!(counterPosition === numCounters || (counterPosition === numCounters - 1 && i === end))) {
                    throw new NotFoundException();
                }
            },

            /**
             * @todo implement
             */
            recordPatternInReverse : function (row, start, counters) {
                throw new Error('not implemented');
            }
        },

        /**
         * @todo finish docs
         * @param {BinaryBitmap} image
         * @param {Object} hints
         */
        decode : function (image, hints) {
            try {
                return this.__doDecode(image, hints);
            } catch (e) {
                var tryHarder = isObject(hints) && hasOwn(hints, DecodeHintType.$static.TRY_HARDER);

                if (tryHarder && image.isRotateSupported()) {
                    var rotatedImage = image.rotateCounterClockwise();
                    var result       = this.__doDecode(rotatedImage, hints);
                    var metadata     = result.getResultMetadata();
                    var orientation  = 270;

                    if (isObject(metadata) && hasOwn(metadata, ResultMetadataType.$static.ORIENTATION)) {
                        orientation = (orientation + metadata.get(ResultMetadataType.$static.ORIENTATION)) % 360;
                    }

                    result.putMetadata(ResultMetadataType.$static.ORIENTATION, orientation);

                    var points = result.getResultPoints();

                    if (isArray(points)) {
                        var height = rotatedImage.getHeight();
                        for (var i = 0; i < points.lenght; i++) {
                            points[i] = new ResultPoint(height - points[i].getY() - 1, points[i].getX());
                        }
                    }
                } else {
                    throw e;
                }
            }
        },

        reset : function () {
            // do nothing
        },

        __doDecode : function (image, hints) {
            var width  = image.getWidth();
            var height = image.getHeight();
            var row    = new BitArray(width);

            var middle    = height >> 1;
            var tryHarder = isObject(hints) && hasOwn(hints, DecodeHintType.$static.TRY_HARDER);
            var rowStep   = Math.max(1, height >> (tryHarder ? 8 : 5));
            var maxLines  = tryHarder ? height : 15;

            for (var x = 0; x < maxLines; x++) {
                var rowStepsAboveOrBelow = Math.floor((x + 1) / 2);
                var isAbove              = (x & 0x01) === 0;
                var rowNumber            = middle + rowStep * (isAbove ? rowStepsAboveOrBelow : -rowStepsAboveOrBelow);

                if (rowNumber < 0 || rowNumber >= height) {
                    break;
                }

                try {
                    row = image.getBlackRow(rowNumber, row);
                } catch (e) {
                    continue;
                }

                for (var attempt = 0; attempt < 2; attempt++) {
                    if (attempt === 1) {
                        row.reverse();

                        if (isObject(hints) && hasOwn(hints, DecodeHintType.$static.NEED_RESULT_POINT_CALLBACK)) {
                            var newHints = {};
                            newHints.putAll(hints);
                            newHints.remove(DecodeHintType.$static.NEED_RESULT_POINT_CALLBACK);
                            hints = newHints;
                        }
                    }

                    try {
                        var result = this.decodeRow(rowNumber, row, hints);

                        if (attempt == 1) {
                            result.putMetadata(ResultMetadataType.$static.ORIENTATION, 180);
                            var points = result.getResultPoints();

                            if (isArray(points)) {
                                points[0] = new ResultPoint(width - points[0].getX() - 1, points[0].getY());
                                points[1] = new ResultPoint(width - points[1].getX() - 1, points[1].getY());
                            }
                        }

                        return result;
                    } catch (e) {
                        // continue -- just couldn't decode this row
                    }
                }
            }

            throw new NotFoundException();
        },

        $abstracts : {
            decodeRow : function (rowNumber, row, hints) {}
        }
    });

    return OneDReader;
});