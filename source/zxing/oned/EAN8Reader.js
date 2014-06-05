define([
    'dejavu/FinalClass',
    'zxing/BarcodeFormat',
    'zxing/oned/UPCEANReader',
    'zxing/oned/UPCEANHelper',
    'zxing/exception/NotFoundException'
], function (FinalClass, BarcodeFormat, UPCEANReader, UPCEANHelper, NotFoundException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var EAN8Reader = FinalClass.declare({
        $name : 'zxing/oned/EAN8Reader',
        $extends : UPCEANReader,

        decodeMiddle : function (row, startRange, resultString) {
            var counters = new Uint32Array(4);
            var end = row.getSize();
            var rowOffset = startRange[1];

            for (var x = 0; x < 4 && rowOffset < end; x++) {
                var bestMatch = UPCEANHelper.$static.decodeDigit(row, counters, rowOffset, UPCEANHelper.$static.L_PATTERNS);
                resultString.append(String.fromCharCode(48 + bestMatch));

                for (var i = 0; i < counters.length; i++) {
                    rowOffset += counters[i];
                }
            }

            var middleRange = UPCEANHelper.$static.findGuardPattern(row, rowOffset, true, UPCEANHelper.$static.MIDDLE_PATTERN);
            rowOffset = middleRange[1];

            for (var x = 0; x < 4 && rowOffset < end; x++) {
                var bestMatch = UPCEANHelper.$static.decodeDigit(row, counters, rowOffset, UPCEANHelper.$static.L_PATTERNS);
                resultString.append(String.fromCharCode(48 + bestMatch));

                for (var i = 0; i < counters.length; i++) {
                    rowOffset += counters[i];
                }
            }

            return rowOffset;
        },

        getBarcodeFormat : function () {
            return BarcodeFormat.$static.EAN_8;
        }
    });

    return EAN8Reader;
});