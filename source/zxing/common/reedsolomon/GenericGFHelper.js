define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var GenericGFHelper = FinalClass.declare({
        $name: 'zxing/common/reedsolomon/GenericGFHelper',
        $statics : {
            addOrSubtract : function (a, b) {
                return a ^ b;
            }
        }
    });

    return GenericGFHelper;
});