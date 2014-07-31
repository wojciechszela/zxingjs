define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var DetectorResult = FinalClass.declare({
        $name: 'zxing/common/DetectorResult',

        __bits : null,
        __points : null,

        initialize : function (bits, points) {
            this.__bits = bits;
            this.__points = points;
        },

        getBits : function () {
            return this.__bits;
        },

        getPoints : function () {
            return this.__points;
        }
    });

    return DetectorResult;
});