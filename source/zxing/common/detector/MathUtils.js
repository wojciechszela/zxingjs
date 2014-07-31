define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var MathUtils = FinalClass.declare({
        $name: 'zxing/common/detector/MathUtils',

        $statics : {
            round : function (d) {
                return Math.floor(d + (d < 0.0 ? -0.5 : 0.5));
            },

            distance : function (aX, aY, bX, bY) {
                var xDiff = aX - bX;
                var yDiff = aY - bY;
                return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            }
        }
    });

    return MathUtils;
});