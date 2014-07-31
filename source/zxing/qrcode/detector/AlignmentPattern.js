define([
    'dejavu/FinalClass',
    'zxing/ResultPoint'
], function (FinalClass, ResultPoint) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var AlignmentPattern = FinalClass.declare({
        $name : 'zxing/qrcode/detector/AlignmentPattern',
        $extends : ResultPoint,

        __estimatedModuleSize : 0.0,

        initialize : function (posX, posY, estimatedModuleSize) {
            this.$super(posX, posY);
            this.__estimatedModuleSize = estimatedModuleSize;
        },

        aboutEquals : function (moduleSize, i, j) {
            if (Math.abs(i - this.getY()) <= moduleSize && Math.abs(j - this.getX()) <= moduleSize) {
                var moduleSizeDiff = Math.abs(moduleSize - this.__estimatedModuleSize);
                return moduleSizeDiff <= 1.0 || moduleSizeDiff <= this.__estimatedModuleSize;
            }

            return false;
        },

        combineEstimate : function (i, j, newModuleSize) {
            var combinedX = (this.getX() + j) / 2.0;
            var combinedY = (this.getY() + i) / 2.0;
            var combinedModuleSize = (this.__estimatedModuleSize + newModuleSize) / 2.0;
            return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
        }
    });

    return AlignmentPattern;
});