define([
    'dejavu/FinalClass',
    'zxing/exception/IllegalArgumentException'
], function (FinalClass, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var DataBlock = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/DataBlock',

        __numDataCodewords : 0,

        __codewords : null,

        initialize : function (numDataCodewords, codewords) {
            this.__numDataCodewords = numDataCodewords;
            this.__codewords = codewords;
        },

        $statics : {
            getDataBlocks : function (rawCodewords, version, ecLevel) {
                if (rawCodewords.length != version.getTotalCodewords()) {
                    throw new IllegalArgumentException();
                }

                var ecBlocks = version.getECBlocksForLevel(ecLevel);

                var totalBlocks = 0;
                var ecBlockArray = ecBlocks.getECBlocks();
                for (var i = 0; i < ecBlockArray.length; i++) {
                    totalBlocks += ecBlockArray[i].getCount();
                }

                var result = new Array(totalBlocks);
                var numResultBlocks = 0;
                for (var _j = 0; _j < ecBlockArray.length; _j++) {
                    var ecBlock = ecBlockArray[_j];
                    for (var i = 0; i < ecBlock.getCount(); i++) {
                        var numDataCodewords = ecBlock.getDataCodewords();
                        var numBlockCodewords = ecBlocks.getECCodewordsPerBlock() + numDataCodewords;
                        result[numResultBlocks++] = new DataBlock(numDataCodewords, new Uint8Array(numBlockCodewords));
                    }
                }

                var shorterBlocksTotalCodewords = result[0].getCodewords().length;
                var longerBlocksStartAt = result.length - 1;
                while (longerBlocksStartAt >= 0) {
                    var numCodewords = result[longerBlocksStartAt].getCodewords().length;
                    if (numCodewords == shorterBlocksTotalCodewords) {
                        break;
                    }
                    longerBlocksStartAt--;
                }
                longerBlocksStartAt++;

                var shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.getECCodewordsPerBlock();
                var rawCodewordsOffset =  0;
                for (var i = 0 ; i < shorterBlocksNumDataCodewords; i++) {
                    for (var j = 0; j < numResultBlocks; j++) {
                        result[j].setCodeword(i, rawCodewords[rawCodewordsOffset++]);
                    }
                }

                for (var j = longerBlocksStartAt; j < numResultBlocks; j++) {
                    result[j].setCodeword(shorterBlocksNumDataCodewords, rawCodewords[rawCodewordsOffset++]);
                }

                var max = result[0].getCodewords().length;
                for (var i = shorterBlocksNumDataCodewords; i < max; i++) {
                    for (var j = 0; j < numResultBlocks; j++) {
                        var iOffset = j < longerBlocksStartAt ? i : i + 1;
                        result[j].setCodeword(iOffset, rawCodewords[rawCodewordsOffset++]);
                    }
                }
                return result;
            }
        },

        getNumDataCodewords : function () {
            return this.__numDataCodewords;
        },

        getCodewords : function () {
            return this.__codewords;
        },

        setCodeword : function (i, codeword) {
            this.__codewords[i] = codeword;
        }
    });

    return DataBlock;
});