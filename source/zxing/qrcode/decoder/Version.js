define([
    'dejavu/FinalClass',
    'zxing/common/BitMatrix',
    'zxing/qrcode/decoder/ECBlocks',
    'zxing/qrcode/decoder/ECB',
    'zxing/qrcode/decoder/FormatInformation',
    'zxing/exception/FormatException'
], function (FinalClass, BitMatrix, ECBlocks, ECB, FormatInformation, FormatException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Version = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/Version',

        $finals : {
            $statics : {
                VERSION_DECODE_INFO : new Uint32Array([
                    0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6,
                    0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78,
                    0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683,
                    0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB,
                    0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250,
                    0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B,
                    0x2542E, 0x26A64, 0x27541, 0x28C69
                ]),

                VERSIONS : [
                    [1, new Uint32Array([]),
                        new ECBlocks(7, new ECB(1, 19)),
                        new ECBlocks(10, new ECB(1, 16)),
                        new ECBlocks(13, new ECB(1, 13)),
                        new ECBlocks(17, new ECB(1, 9))
                    ],
                    [2, new Uint32Array([6, 18]),
                        new ECBlocks(10, new ECB(1, 34)),
                        new ECBlocks(16, new ECB(1, 28)),
                        new ECBlocks(22, new ECB(1, 22)),
                        new ECBlocks(28, new ECB(1, 16))
                    ],
                    [3, new Uint32Array([6, 22]),
                        new ECBlocks(15, new ECB(1, 55)),
                        new ECBlocks(26, new ECB(1, 44)),
                        new ECBlocks(18, new ECB(2, 17)),
                        new ECBlocks(22, new ECB(2, 13))
                    ],
                    [4, new Uint32Array([6, 26]),
                        new ECBlocks(20, new ECB(1, 80)),
                        new ECBlocks(18, new ECB(2, 32)),
                        new ECBlocks(26, new ECB(2, 24)),
                        new ECBlocks(16, new ECB(4, 9))
                    ],
                    [5, new Uint32Array([6, 30]),
                        new ECBlocks(26, new ECB(1, 108)),
                        new ECBlocks(24, new ECB(2, 43)),
                        new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)),
                        new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))
                    ],
                    [6, new Uint32Array([6, 34]),
                        new ECBlocks(18, new ECB(2, 68)),
                        new ECBlocks(16, new ECB(4, 27)),
                        new ECBlocks(24, new ECB(4, 19)),
                        new ECBlocks(28, new ECB(4, 15))
                    ],
                    [7, new Uint32Array([6, 22, 38]),
                        new ECBlocks(20, new ECB(2, 78)),
                        new ECBlocks(18, new ECB(4, 31)),
                        new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)),
                        new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))
                    ],
                    [8, new Uint32Array([6, 24, 42]),
                        new ECBlocks(24, new ECB(2, 97)),
                        new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)),
                        new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)),
                        new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))
                    ],
                    [9, new Uint32Array([6, 26, 46]),
                        new ECBlocks(30, new ECB(2, 116)),
                        new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)),
                        new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)),
                        new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))
                    ],
                    [10, new Uint32Array([6, 28, 50]),
                        new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)),
                        new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)),
                        new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)),
                        new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))
                    ],
                    [11, new Uint32Array([6, 30, 54]),
                        new ECBlocks(20, new ECB(4, 81)),
                        new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)),
                        new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)),
                        new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))
                    ],
                    [12, new Uint32Array([6, 32, 58]),
                        new ECBlocks(20, new ECB(4, 81)),
                        new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)),
                        new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)),
                        new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))
                    ],
                    [13, new Uint32Array([6, 34, 62]),
                        new ECBlocks(26, new ECB(4, 107)),
                        new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)),
                        new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)),
                        new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))
                    ],
                    [14, new Uint32Array([6, 26, 46, 66]),
                        new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)),
                        new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)),
                        new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)),
                        new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))
                    ],[15, new Uint32Array([6, 26, 48, 70]),
                        new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)),
                        new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)),
                        new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)),
                        new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))
                    ],[16, new Uint32Array([6, 26, 50, 74]),
                        new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)),
                        new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)),
                        new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)),
                        new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))
                    ],[17, new Uint32Array([6, 30, 54, 78]),
                        new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)),
                        new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)),
                        new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)),
                        new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))
                    ],[18, new Uint32Array([6, 30, 56, 82]),
                        new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)),
                        new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)),
                        new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)),
                        new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))
                    ],[19, new Uint32Array([6, 30, 58, 86]),
                        new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)),
                        new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)),
                        new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)),
                        new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))
                    ],[20, new Uint32Array([6, 34, 62, 90]),
                        new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)),
                        new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)),
                        new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)),
                        new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))
                    ],[21, new Uint32Array([6, 28, 50, 72, 94]),
                        new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)),
                        new ECBlocks(26, new ECB(17, 42)),
                        new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)),
                        new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))
                    ],[22, new Uint32Array([6, 26, 50, 74, 98]),
                        new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)),
                        new ECBlocks(28, new ECB(17, 46)),
                        new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)),
                        new ECBlocks(24, new ECB(34, 13))
                    ],[23, new Uint32Array([6, 30, 54, 78, 102]),
                        new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)),
                        new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)),
                        new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)),
                        new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))
                    ],[24, new Uint32Array([6, 28, 54, 80, 106]),
                        new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)),
                        new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)),
                        new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)),
                        new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))
                    ],[25, new Uint32Array([6, 32, 58, 84, 110]),
                        new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)),
                        new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)),
                        new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)),
                        new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))
                    ],[26, new Uint32Array([6, 30, 58, 86, 114]),
                        new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)),
                        new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)),
                        new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)),
                        new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))
                    ],[27, new Uint32Array([6, 34, 62, 90, 118]),
                        new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)),
                        new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)),
                        new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)),
                        new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))
                    ],[28, new Uint32Array([6, 26, 50, 74, 98, 122]),
                        new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)),
                        new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)),
                        new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)),
                        new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))
                    ],[29, new Uint32Array([6, 30, 54, 78, 102, 126]),
                        new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)),
                        new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)),
                        new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)),
                        new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))
                    ],[30, new Uint32Array([6, 26, 52, 78, 104, 130]),
                        new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)),
                        new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)),
                        new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)),
                        new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))
                    ],[31, new Uint32Array([6, 30, 56, 82, 108, 134]),
                        new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)),
                        new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)),
                        new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)),
                        new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))
                    ],[32, new Uint32Array([6, 34, 60, 86, 112, 138]),
                        new ECBlocks(30, new ECB(17, 115)),
                        new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)),
                        new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)),
                        new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))
                    ],[33, new Uint32Array([6, 30, 58, 86, 114, 142]),
                        new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)),
                        new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)),
                        new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)),
                        new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))
                    ],[34, new Uint32Array([6, 34, 62, 90, 118, 146]),
                        new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)),
                        new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)),
                        new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)),
                        new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))
                    ],[35, new Uint32Array([6, 30, 54, 78, 102, 126, 150]),
                        new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)),
                        new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)),
                        new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)),
                        new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))
                    ],[36, new Uint32Array([6, 24, 50, 76, 102, 128, 154]),
                        new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)),
                        new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)),
                        new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)),
                        new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))
                    ],[37, new Uint32Array([6, 28, 54, 80, 106, 132, 158]),
                        new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)),
                        new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)),
                        new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)),
                        new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))
                    ],[38, new Uint32Array([6, 32, 58, 84, 110, 136, 162]),
                        new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)),
                        new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)),
                        new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)),
                        new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))
                    ],[39, new Uint32Array([6, 26, 54, 82, 110, 138, 166]),
                        new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)),
                        new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)),
                        new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)),
                        new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))
                    ],[40, new Uint32Array([6, 30, 58, 86, 114, 142, 170]),
                        new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)),
                        new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)),
                        new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)),
                        new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))
                    ]
                ]
            },
        },

        __versionNumber : 0,

        __alignmentPatternCenters : null,

        __ecBlocks : null,

        __totalCodewords : 0,

        initialize : function () {
            var args = arguments;

            if (args.length == 1) {
                args = arguments[0];
            }

            this.__versionNumber = args[0];
            this.__alignmentPatternCenters = args[1];

            var ecBlocks = new Array();
            for (var i = 2; i < args.length; i++) {
                ecBlocks.push(args[i]);
            }
            this.__ecBlocks = ecBlocks;
            var total = 0;
            var ecCodewords = ecBlocks[0].getECCodewordsPerBlock();
            var ecbArray = ecBlocks[0].getECBlocks();
            for (var i = 0; i < ecbArray.length; i++) {
                var ecBlock = ecbArray[i];
                total += ecBlock.getCount() * (ecBlock.getDataCodewords() + ecCodewords);
            }
            this.__totalCodewords = total;
        },

        getVersionNumber : function () {
            return this.__versionNumber;
        },

        getAlignmentPatternCenters : function () {
            return this.__alignmentPatternCenters;
        },

        getTotalCodewords : function () {
            return this.__totalCodewords;
        },

        getDimensionForVersion : function () {
            return 17 + 4 * this.__versionNumber;
        },

        getECBlocksForLevel : function (ecLevel) {
            return this.__ecBlocks[ecLevel.ordinal()];
        },

        $statics : {
            getProvisionalVersionForDimension : function (dimension) {
                if (dimension % 4 != 1) {
                    throw new FormatException();
                }

                try {
                    return this.$static.getVersionForNumber(Math.floor((dimension - 17) / 4));
                } catch (e) {
                    throw new FormatException();
                }
            },

            getVersionForNumber : function (versionNumber) {
                if (versionNumber < 1 || versionNumber > 40) {
                    throw new IllegalArgumentsException();
                }

                var versionArgs = this.$static.VERSIONS[versionNumber - 1];
                return new Version(versionArgs);
            },

            decodeVersionInformation : function (versionBits) {
                var bestDifference = Math.pow(2, 31) - 1; // Integer.MAX_VALUE;
                var bestVersion = 0;
                for (var i = 0; i < this.$static.VERSION_DECODE_INFO.length; i++) {
                    var targetVersion = this.$static.VERSION_DECODE_INFO[i];
                    if (targetVersion == versionBits) {
                        return this.$static.getVersionForNumber(i + 7);
                    }

                    var bitsDifference = FormatInformation.$static.numBitsDiffering(versionBits, targetVersion);
                    if (bitsDifference < bestDifference) {
                        bestVersion = i + 7;
                        bestDifference = bitsDifference;
                    }
                }

                if (bestDifference <= 3) {
                    return this.$static.getVersionForNumber(bestVersion);
                }

                return null;
            }
        },

        buildFunctionPattern : function () {
            var dimension = this.getDimensionForVersion();
            var bitMatrix = new BitMatrix(dimension);

            bitMatrix.setRegion(0, 0, 9, 9);
            bitMatrix.setRegion(dimension - 8, 0, 8, 9);
            bitMatrix.setRegion(0, dimension - 8, 9, 8);

            var max = this.__alignmentPatternCenters.length;
            for (var x = 0; x < max; x++) {
                var i = this.__alignmentPatternCenters[x] - 2;
                for (var y = 0; y < max; y++) {
                    if ((x == 0 && (y == 0 || y == max - 1)) || (x == max - 1 && y == 0)) {
                        continue;
                    }
                    bitMatrix.setRegion(this.__alignmentPatternCenters[y] - 2, i, 5, 5);
                }
            }

            bitMatrix.setRegion(6, 9, 1, dimension - 17);
            bitMatrix.setRegion(9, 6, dimension - 17, 1);

            if (this.__versionNumber > 6) {
                bitMatrix.setRegion(dimension - 11, 0, 3, 6);
                bitMatrix.setRegion(0, dimension - 11, 6, 3);
            }

            return bitMatrix;
        }
    });

    return Version;
});