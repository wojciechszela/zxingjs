define([
    'dejavu/Class',
    'zxing/DecodeHintType',
    'zxing/ResultPoint',
    'zxing/qrcode/detector/FinderPattern',
    'zxing/qrcode/detector/FinderPatternInfo',
    'zxing/qrcode/detector/FurthestFromAverageComparator',
    'zxing/qrcode/detector/CenterComparator',
    'zxing/exception/NotFoundException',
    'mout/lang/isObject',
    'mout/object/hasOwn'
], function (Class, DecodeHintType, ResultPoint, FinderPattern, FinderPatternInfo, FurthestFromAverageComparator, CenterComparator, NotFoundException, isObject, hasOwn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var FinderPatternFinder = Class.declare({
        $name : 'zxing/qrcode/detector/FinderPatternFinder',

        $finals : {
            $statics : {
                CENTER_QUORUM : 2,
                MIN_SKIP : 3,
                MAX_MODULES : 57
            },

            _getImage : function () {
                return this.__image;
            },

            _getPossibleCenters : function () {
                return this.__possibleCenters;
            },

            find : function (hints) {
                var tryHarder = isObject(hints) && hasOwn(hints, DecodeHintType.$static.TRY_HARDER);
                var pureBarcode = isObject(hints) && hasOwn(hints, DecodeHintType.$static.PURE_BARCODE);

                var maxI = this.__image.getHeight();
                var maxJ = this.__image.getWidth();

                var iSkip = Math.floor((3 * maxI) / (4 * this.$static.MAX_MODULES));
                if (iSkip < this.$static.MIN_SKIP || tryHarder) {
                    iSkip = this.$static.MIN_SKIP;
                }

                var done = false;
                var stateCount = new Uint32Array(5);
                for (var i = iSkip - 1; i < maxI && !done; i += iSkip) {
                    stateCount[0] = 0;
                    stateCount[1] = 0;
                    stateCount[2] = 0;
                    stateCount[3] = 0;
                    stateCount[4] = 0;
                    var currentState = 0;
                    for (var j = 0; j < maxJ; j++) {
                        if (this.__image.get(j, i)) {
                            if ((currentState & 1) == 1) {
                                currentState++;
                            }
                            stateCount[currentState]++;
                        } else {
                            if ((currentState & 1) == 0) {
                                if (currentState == 4) {
                                    if (this.$static.foundPatternCross(stateCount)) {
                                        var confirmed = this._handlePossibleCenter(stateCount, i, j, pureBarcode);
                                        if (confirmed) {
                                            iSkip = 2;
                                            if (this.__hasSkipped) {
                                                done = this.__haveMultiplyConfirmedCenters();
                                            } else {
                                                var rowSkip = this.__findRowSkip();
                                                if (rowSkip > stateCount[2]) {
                                                    i += rowSkip - stateCount[2] - iSkip;
                                                    j = maxJ - 1;
                                                }
                                            }
                                        } else {
                                            stateCount[0] = stateCount[2];
                                            stateCount[1] = stateCount[3];
                                            stateCount[2] = stateCount[4];
                                            stateCount[3] = 1;
                                            stateCount[4] = 0;
                                            currentState = 3;
                                            continue;
                                        }
                                        currentState = 0;
                                        stateCount[0] = 0;
                                        stateCount[1] = 0;
                                        stateCount[2] = 0;
                                        stateCount[3] = 0;
                                        stateCount[4] = 0;
                                    } else {
                                        stateCount[0] = stateCount[2];
                                        stateCount[1] = stateCount[3];
                                        stateCount[2] = stateCount[4];
                                        stateCount[3] = 1;
                                        stateCount[4] = 0;
                                        currentState = 3;
                                    }
                                } else {
                                    stateCount[++currentState]++;
                                }
                            } else {
                                stateCount[currentState]++;
                            }
                        }
                    }
                    if (this.$static.foundPatternCross(stateCount)) {
                        var confirmed = this._handlePossibleCenter(stateCount, i, maxJ, pureBarcode);
                        if (confirmed) {
                            iSkip = stateCount[0];
                            if (this.__hasSkipped) {
                                done = this.__haveMultiplyConfirmedCenters();
                            }
                        }
                    }
                }

                var patternInfo = this.__selectBestPatterns();
                ResultPoint.$static.orderBestPatterns(patternInfo);

                return new FinderPatternInfo(patternInfo);
            },

            _handlePossibleCenter : function (stateCount, i, j, pureBarcode) {
                var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
                var centerJ = this.$static.centerFromEnd(stateCount, j);
                var centerI = this.__crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal);
                if (!isNaN(centerI)) {
                    centerJ = this.__crossCheckHorizontal(Math.floor(centerJ), Math.floor(centerI), stateCount[2], stateCountTotal);
                    if (!isNaN(centerJ) && (!pureBarcode || this.__crossCheckDiagonal(Math.floor(centerI), Math.floor(centerJ), stateCount[2], stateCountTotal))) {
                        var estimatedModuleSize = stateCountTotal / 7.0;
                        var found = false;
                        for (var index = 0; index < this.__possibleCenters.length; index++) {
                            var center = this.__possibleCenters[index];

                            if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                                this.__possibleCenters[index] = center.combineEstimate(centerI, centerJ, estimatedModuleSize);
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
                            this.__possibleCenters.push(point);
                            if (this.__resultPointCallback != null) {
                                this.__resultPointCallback.foundPossibleResultPoint(point);
                            }
                        }
                        return true;
                    }
                }
                return false;
            }
        },

        __image : null,

        __possibleCenters : null,

        __hasSkipped : false,

        __crossCheckStateCount : null,

        __resultPointCallback : null,

        initialize : function (image, resultPointCallback) {
            this.__image = image;
            this.__possibleCenters = [];
            this.__crossCheckStateCount = new Uint32Array(5);
            this.__resultPointCallback = resultPointCallback || null;
        },

        $statics : {
            centerFromEnd : function (stateCount, end) {
                return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
            },

            foundPatternCross : function (stateCount) {
                var totalModuleSize = 0;
                for (var i = 0; i < 5; i++) {
                    var count = stateCount[i];
                    if (count == 0) {
                        return false;
                    }
                    totalModuleSize += count;
                }
                if (totalModuleSize < 7) {
                    return false;
                }
                var moduleSize = totalModuleSize / 7.0;
                var maxVariance = moduleSize / 2.0;

                return Math.abs(moduleSize - stateCount[0]) < maxVariance &&
                       Math.abs(moduleSize - stateCount[1]) < maxVariance &&
                       Math.abs(3.0 * moduleSize - stateCount[2]) < 3 * maxVariance &&
                       Math.abs(moduleSize - stateCount[3]) < maxVariance &&
                       Math.abs(moduleSize - stateCount[4]) < maxVariance;
            }
        },

        __getCrossCheckStateCount : function () {
            this.__crossCheckStateCount[0] = 0;
            this.__crossCheckStateCount[1] = 0;
            this.__crossCheckStateCount[2] = 0;
            this.__crossCheckStateCount[3] = 0;
            this.__crossCheckStateCount[4] = 0;
            return this.__crossCheckStateCount;
        },

        __crossCheckDiagonal : function (startI, centerJ, maxCount, originalStateCountTotal) {
            var stateCount = this.__getCrossCheckStateCount();

            var i = 0;
            while (startI >= i && centerJ >= i && this.__image.get(centerJ - i, startI - i)) {
                stateCount[2]++;
                i++;
            }

            if (startI < i || centerJ < i) {
                return false;
            }

            while (startI >= i && centerJ >= i && !this.__image.get(centerJ - i, startI - i) && stateCount[1] <= maxCount) {
                stateCount[1]++;
                i++;
            }

            if (startI < i || centerJ < i || stateCount[1] > maxCount) {
                return false;
            }

            while (startI >= i && centerJ >= i && this.__image.get(centerJ - i, startI - i) && stateCount[0] <= maxCount) {
                stateCount[0]++;
                i++;
            }
            if (stateCount[0] > maxCount) {
                return false;
            }

            var maxI = this.__image.getHeight();
            var maxJ = this.__image.getWidth();

            i = 1;
            while (startI + i < maxI && centerJ + i < maxJ && this.__image.get(centerj + i, startI + i)) {
                stateCount[2]++;
                i++;
            }

            if (startI + i >= maxI || centerJ + i >= maxJ) {
                return false;
            }

            while (startI + i < maxI && centerJ + i < maxJ && !this.__image.get(centerJ + i, startI + i) && stateCount[3] < maxCount) {
                stateCount[3]++;
                i++;
            }

            if (start + i >= maxI || centerJ + i >= maxJ || stateCount[3] >= maxCount) {
                return false;
            }

            while (startI + i < maxI && centerJ + i < maxJ && this.__image.get(centerJ + i, startI + i) && stateCount[4] < maxCount) {
                stateCount[4]++;
                i++;
            }

            if (stateCount[4] >= maxCount) {
                return false;
            }

            var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
            return Math.abs(stateCountTotal - originalStateCountTotal) < 2 * originalStateCountTotal && this.$static.foundPatternCross(stateCount);
        },

        __crossCheckVertical : function (startI, centerJ, maxCount, originalStateCountTotal) {
            var image = this.__image;

            var maxI = image.getHeight();
            var stateCount = this.__getCrossCheckStateCount();

            var i = startI;
            while (i >= 0 && image.get(centerJ, i)) {
                stateCount[2]++;
                i--;
            }
            if (i < 0) {
                return NaN;
            }
            while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= maxCount) {
                stateCount[1]++;
                i--;
            }

            if (i < 0 || stateCount[1] > maxCount) {
                return NaN;
            }
            while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= maxCount) {
                stateCount[0]++;
                i--;
            }
            if (stateCount[0] > maxCount) {
                return NaN;
            }

            i = startI + 1;
            while (i < maxI && image.get(centerJ, i)) {
                stateCount[2]++;
                i++;
            }
            if (i == maxI) {
                return NaN;
            }
            while (i < maxI && !image.get(centerJ, i) && stateCount[3] < maxCount) {
                stateCount[3]++;
                i++;
            }
            if (i == maxI || stateCount[3] >= maxCount) {
                return NaN;
            }
            while (i < maxI && image.get(centerJ, i) && stateCount[4] < maxCount) {
                stateCount[4]++;
                i++;
            }
            if (stateCount[4] >= maxCount) {
                return NaN;
            }

            var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
            if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
                return NaN;
            }

            return this.$static.foundPatternCross(stateCount) ? this.$static.centerFromEnd(stateCount, i) : NaN;
        },

        __crossCheckHorizontal : function (startJ, centerI, maxCount, originalStateCountTotal) {
            var image = this.__image;

            var maxJ = image.getWidth();
            var stateCount = this.__getCrossCheckStateCount();

            var j = startJ;
            while (j >= 0 && image.get(j, centerI)) {
                stateCount[2]++;
                j--;
            }
            if (j < 0) {
                return NaN;
            }
            while (j >= 0 && !image.get(j, centerI) && stateCount[1] <= maxCount) {
                stateCount[1]++;
                j--;
            }
            if (j < 0 || stateCount[1] > maxCount) {
                return NaN;
            }
            while (j >= 0 && image.get(j, centerI) && stateCount[0] <= maxCount) {
                stateCount[0]++;
                j--;
            }
            if (stateCount[0] > maxCount) {
                return NaN;
            }

            j = startJ + 1;
            while (j < maxJ && image.get(j, centerI)) {
                stateCount[2]++;
                j++;
            }
            if (j == maxJ) {
                return NaN;
            }
            while(j < maxJ && !image.get(j, centerI) && stateCount[3] < maxCount) {
                stateCount[3]++;
                j++;
            }
            if (j == maxJ || stateCount[3] >= maxCount) {
                return NaN;
            }
            while (j < maxJ && image.get(j, centerI) && stateCount[4] < maxCount) {
                stateCount[4]++;
                j++;
            }
            if (stateCount[4] >= maxCount) {
                return NaN;
            }

            var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
            if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
                return NaN;
            }

            return this.$static.foundPatternCross(stateCount) ? this.$static.centerFromEnd(stateCount, j) : NaN;
        },

        __findRowSkip : function () {
            var max = this.__possibleCenters.length;
            if (max <= 1) {
                return 0;
            }

            var firstConfirmedCenter = null;
            for (var _i = 0; _i < this.__possibleCenters; _i++) {
                var center = this.__possibleCenters[_i];
                if (center.getCount() >= this.$static.CENTER_QUORUM) {
                    if (firstConfirmedCenter == null) {
                        firstConfirmedCenter = center;
                    } else {
                        hasSkipped = true;
                        return Math.floor((Math.abs(firstConfirmedCenter.getX() - center.getX()) - Math.abs(firstConfirmedCenter.getY() - center.getY())) / 2);
                    }
                }
            }
            return 0;
        },

        __haveMultiplyConfirmedCenters : function () {
            var confirmedCount = 0;
            var totalModuleSize = 0.0;
            var max = this.__possibleCenters.length;
            for (var _i = 0; _i < this.__possibleCenters.length; _i++) {
                var pattern = this.__possibleCenters[_i];
                if (pattern.getCount() >= this.$static.CENTER_QUORUM) {
                    confirmedCount++;
                    totalModuleSize += pattern.getEstimatedModuleSize();
                }
            }
            if (confirmedCount < 3) {
                return false;
            }

            var average = totalModuleSize / max;
            var totalDeviation = 0.0;
            for (var _i = 0; _i < this.__possibleCenters.length; _i++) {
                totalDeviation = Math.abs(this.__possibleCenters[_i].getEstimatedModuleSize() - average);
            }
            return totalDeviation <= 0.05 * totalModuleSize;
        },

        __selectBestPatterns : function () {
            var startSize = this.__possibleCenters.length;
            if (startSize < 3) {
                throw new NotFoundException();
            }

            if (startSize > 3) {
                var totalModuleSize = 0.0;
                var square = 0.0;
                for (var _i = 0; _i < this.__possibleCenters.lengt; _i++) {
                    var size = this.__possibleCenters[_i].getEstimatedModuleSize();
                    totalModuleSize += size;
                    square += size * size;
                }
                var average = totalModuleSize / startSize;
                var stdDev = Math.sqrt(square / startSize - average * average);

                var comparator = new FurthestFromAverageComparator(average);
                this.__possibleCenters.sort(function (a, b) {
                    return comparator.compare(a, b);
                });

                var limit = Math.max(0.2 * average, stdDev);

                for (var i = 0; i < this.__possibleCenters.length && this.__possibleCenters.length > 3; i++) {
                    var pattern = this.__possibleCenters[i];
                    if (Math.abs(pattern.getEstimatedModuleSize() - average) > limit) {
                        this.__possibleCenters = [].concat(this.__possibleCenters.slice(0, i),  this.__possibleCenters.slice(i + 1));
                        i--;
                    }
                }
            }

            if (this.__possibleCenters.length > 3) {
                var totalModuleSize = 0.0;
                for (var _i = 0; _i < this.__possibleCenters.length; _i++) {
                    totalModuleSize += this.__possibleCenters[_i].getEstimatedModuleSize();
                }

                var average = totalModuleSize / this.__possibleCenters.length;

                var comparator = new CenterComparator(average);
                this.__possibleCenters.sort(function (a, b) {
                    return comparator.compare(a, b);
                });

                this.__possibleCenters = this.__possibleCenters.slice(0, 3);
            }

            return [this.__possibleCenters[0], this.__possibleCenters[1], this.__possibleCenters[2]];
        }
    });

    return FinderPatternFinder;
});