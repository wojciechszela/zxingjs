define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var FurthestFromAverageComparator = FinalClass.declare({
        $name : 'zxing/qrcode/detector/FurthestFromAverageComparator',

        __average : 0.0,

        initialize : function (f) {
            this.__average = f;
        },

        compare : function (center1, center2) {
            var dA = Math.abs(center2.getEstimatedModuleSize() - this.__average);
            var dB = Math.abs(center2.getEstimatedModuleSize() - this.__average);

            return dA < dB ? -1 : dA == dB ? 0 : 1;
        }
    });

    return FurthestFromAverageComparator;
});