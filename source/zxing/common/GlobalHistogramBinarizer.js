define([
    'dejavu/Class',
    'zxing/Binarizer',
    'zxing/common/BitArray',
    'zxing/common/BitMatrix',
    'zxing/exception/NotFoundException',
    'mout/lang/isObject'
], function (Class, Binarizer, BitArray, BitMatrix, NotFoundException, isObject) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var GlobalHistogramBinarizer = Class.declare({
        $name    : 'zxing/common/GlobalHistogramBinarizer',
        $extends : Binarizer,

        __buckets : null,

        __pixels : null,

        $finals : {
            $statics : {
                LUMINANCE_BITS : 5,
                LUMINANCE_SHIFT : 8 - 5, // 8 - LUMINANCE_BITS
                LUMINANCE_BUCKETS : 1 << 5, // 1 << LUMINANCE_BITS
                EMPTY : (function () { var arr = new Uint8Array(1); arr[0] = 0; return arr; })()
            }
        },

        __estimateBlackPoint : function (buckets) {
            var numBuckets = buckets.length;
            var maxBucketCount = 0;
            var firstPeak = 0;
            var firstPeakSize = 0;
            for (var x = 0; x < numBuckets; x++) {
                if (buckets[x] > firstPeakSize) {
                    firstPeak = x;
                    firstPeakSize = buckets[x];
                }
                if (buckets[x] > maxBucketCount) {
                    maxBucketCount = buckets[x];
                }

            }

            var secondPeak = 0;
            var secondPeakScore = 0;
            for (var x = 0; x < numBuckets; x++) {
                var distanceToBiggest = x - firstPeak;
                var score = buckets[x] * distanceToBiggest * distanceToBiggest;
                if (score > secondPeakScore) {
                    secondPeak = x;
                    secondPeakScore = score;
                }
            }

            if (firstPeak > secondPeak) {
                var temp = firstPeak;
                firstPeak = secondPeak;
                secondPeak = temp;
            }

            if (secondPeak - firstPeak <= Math.floor(numBuckets / 16)) {
                throw new NotFoundException();
            }

            var bestValley = secondPeak - 1;
            var bestValleyScore = -1;

            for (var x = secondPeak - 1; x > firstPeak; x--) {
                var fromFirst = x - firstPeak;
                var score = fromFirst * fromFirst * (secondPeak - x) * (maxBucketCount - buckets[x]);

                if (score > bestValleyScore) {
                    bestValley = x;
                    bestValleyScore = score;
                }
            }

            return bestValley << this.$static.LUMINANCE_SHIFT;
        },

        /**
         * @todo finish docs
         * @param {LuminanceSource} source
         */
        initialize : function (source) {
            this.$super(source);
            this.__pixels  = new Uint8Array(0);
            this.__buckets = new Uint32Array(this.$static.LUMINANCE_BUCKETS);
        },

        getBlackRow : function (y, row) {
            var source = this.getLuminanceSource();
            var width  = source.getWidth();

            if (!isObject(row) || row.getSize() < width) {
                row = new BitArray(width);
            } else {
                row.clear();
            }

            this.__initArrays(width);
            var localLuminances = source.getRow(y, this.__pixels);
            var localBuckets    = this.__buckets;

            for (var x = 0; x < width; x++) {
                var pixel = localLuminances[x] & 0xFF;
                localBuckets[pixel >> this.$static.LUMINANCE_SHIFT]++;
            }
            var blackPoint = this.__estimateBlackPoint(localBuckets);

            var left   = localLuminances[0] & 0xFF;
            var center = localLuminances[1] & 0xFF;

            for (var x = 1; x < width - 1; x++) {
                var right     = localLuminances[x + 1] & 0xFF;
                var luminance = Math.floor(((center * 4) - left - right) / 2);

                if (luminance < blackPoint) {
                    row.set(x);
                }

                left   = center;
                center = right;
            }

            return row;
        },

        getBlackMatrix : function () {
            var source = this.getLuminanceSource();
            var width  = source.getWidth();
            var height = source.getHeight();
            var matrix = new BitMatrix(width, height);

            this.__initArrays(width);
            var localBuckets = this.__buckets;

            for (var y = 1; y < 5; y++) {
                var row = Math.floor(height * y / 5);
                var localLuminances = source.getRow(row, this.__pixels);
                var right = Math.floor((width * 4) / 5);

                for (var x = Math.floor(width / 5); x < right; x++) {
                    var pixel = localLuminances[x] & 0xFF;
                    localBuckets[pixel >> this.$static.LUMINANCE_SHIFT]++;
                }
            }

            var blackPoint = this.__estimateBlackPoint(localBuckets);

            var localLuminances = source.getMatrix();
            for (var y = 0; y < height; y++) {
                var offset = y * width;
                for (var x = 0; x < width; x++) {
                    var pixel = localLuminances[offset + x] & 0xFF;
                    if (pixel < blackPoint) {
                        matrix.set(x, y);
                    }
                }
            }

            return matrix;
        },

        createBinarizer : function (source) {
            return new GlobalHistogramBinarizer(source);
        },

        __initArrays : function (luminanceSize) {
            if (this.__pixels.length < luminanceSize * 4) {
                this.__pixels = new Uint8Array(luminanceSize * 4);
            }

            for (var x = 0; x < this.$static.LUMINANCE_BUCKETS; x++) {
                this.__buckets[x] = 0;
            }
        }
    });

    return GlobalHistogramBinarizer;
});