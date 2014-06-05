define([
    'dejavu/FinalClass',
    'zxing/oned/UPCEANHelper',
    'zxing/oned/UPCEANExtension2Support',
    'zxing/oned/UPCEANExtension5Support'
], function (FinalClass, UPCEANHelper, UPCEANExtension2Support, UPCEANExtension5Support) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var UPCEANExtensionSupport = FinalClass.declare({
        $name : 'zxing/oned/UPCEANExtensionSupport',

        $statics : {
            EXTENSION_START_PATTERN : new Uint32Array([1, 1, 2])
        },

        __twoSupport : null,
        __fiveSupport : null,

        initialize : function () {
            this.__twoSupport = new UPCEANExtension2Support();
            this.__fiveSupport = new UPCEANExtension5Support();
        },

        decodeRow : function (rowNumber, row, rowOffset) {
            var extensionStartRange = UPCEANHelper.$static.findGuardPattern(row, rowOffset, false, this.$static.EXTENSION_START_PATTERN);

            try {
                return this.__fiveSupport.decodeRow(rowNumber, row, extensionStartRange);
            } catch (e) {
                return this.__twoSupport.decodeRow(rowNumber, row, extensionStartRange);
            }
        }
    });

    return UPCEANExtensionSupport;
});