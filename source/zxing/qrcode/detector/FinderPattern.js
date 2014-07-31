define([
    'dejavu/FinalClass',
    'zxing/ResultPoint'
], function (FinalClass, ResultPoint) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var FinderPattern = FinalClass.declare({
        $name : 'zxing/qrcode/detector/FinderPattern',
        $extends : ResultPoint,

        __estimatedModuleSize : 0.0,
        __count : 0,

        initialize : function (posX, posY, estimatedModuleSize, count) {
            var c = arguments.length == 3 ? 1 : count;

            this.$super(posX, posY, estimatedModuleSize, c);
            this.__estimatedModuleSize = estimatedModuleSize;
            this.__count = c;
        },

        getEstimatedModuleSize : function () {
            return this.__estimatedModuleSize;
        },

        getCount : function () {
            return this.__count;
        },

        aboutEquals : function (moduleSize, i, j) {
            if (Math.abs(i - this.getY()) <= moduleSize && Math.abs(j - this.getX()) <= moduleSize) {
                var moduleSizeDiff = Math.abs(moduleSize - this.__estimatedModuleSize);
                return moduleSizeDiff <= 1.0 || moduleSizeDiff <= this.__estimatedModuleSize;
            }

            return false;
        },

        combineEstimate : function (i, j, newModuleSize) {
            var combinedCount = this.__count + 1;
            var combinedX = (this.__count * this.getX() + j) / combinedCount;
            var combinedY = (this.__count * this.getY() + i) / combinedCount;
            var combinedModuleSize = (this.__count * this.__estimatedModuleSize + newModuleSize) / combinedCount;

            return new FinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
        }
    });

    return FinderPattern;
});