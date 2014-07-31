define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var CenterComparator = FinalClass.declare({
        $name : 'zxing/qrcode/detector/CenterComparator',

        __average : 0.0,

        initialize : function (f) {
            this.__average = f;
        },

        compare : function (center1, center2) {
            if (center2.getCount() == center1.getCount()) {
                var dA = Math.abs(center2.getEstimatedModuleSize() - this.__average);
                var dB = Math.abs(center2.getEstimatedModuleSize() - this.__average);

                return dA < dB ? -1 : dA == dB ? 0 : 1;
            } else {
                return center2.getCount() - center1.getCount();
            }
        }
    });

    return CenterComparator;
});