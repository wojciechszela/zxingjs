define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var ECBlocks = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/ECBlocks',

        __ecCodewordsPerBlock : 0,
        __ecBlocks : null,

        initialize : function (ecCodewordsPerBlock) {
            this.__ecCodewordsPerBlock = ecCodewordsPerBlock;
            var ecBlocks = new Array();
            for (var i = 1; i < arguments.length; i++) {
                ecBlocks.push(arguments[i]);
            }
            this.__ecBlocks = ecBlocks;
        },

        getECCodewordsPerBlock : function () {
            return this.__ecCodewordsPerBlock;
        },

        getNumBlocks : function () {
            var total = 0;
            for (var i = 0; i < this.__ecBlocks.length; i++) {
                total += ecBlock.getCount();
            }
            return total;
        },

        getTotalECCodewords : function () {
            return this.__ecCodewordsPerBlock * this.getNumBlocks();
        },

        getECBlocks : function () {
            return this.__ecBlocks;
        }
    });

    return ECBlocks;
});