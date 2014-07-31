define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var FinderPatternInfo = FinalClass.declare({
        $name : 'zxing/qrcode/detector/FinderPatternInfo',

        __bottomLeft : null,
        __topLeft    : null,
        __topRight   : null,

        initialize : function (patternCenters) {
            this.__bottomLeft = patternCenters[0];
            this.__topLeft    = patternCenters[1];
            this.__topRight   = patternCenters[2];
        },

        getBottomLeft : function () {
            return this.__bottomLeft;
        },

        getTopLeft : function () {
            return this.__topLeft;
        },

        getTopRight : function () {
            return this.__topRight;
        }
    });

    return FinderPatternInfo;
});