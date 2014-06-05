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
    var EAN13Reader = FinalClass.declare({
        $name : 'zxing/oned/EAN13Reader',
        $extends : UPCEANReader,

        $statics : {
            FIRST_DIGIT_ENCODINGS : [0x00, 0x0B, 0x0D, 0xE, 0x13, 0x19, 0x1C, 0x15, 0x16, 0x1A],
        },

        decodeMiddle : function (row, startRange, resultString) {
            var counters = new Uint32Array(4);
            var end = row.getSize();
            var rowOffset = startRange[1];

            var lgPatternFound = 0;

            for (var x = 0; x < 6 && rowOffset < end; x++) {
                var bestMatch = UPCEANHelper.$static.decodeDigit(row, counters, rowOffset, UPCEANHelper.$static.L_AND_G_PATTERNS);
                resultString.append(String.fromCharCode(48 + bestMatch % 10));

                for (var i = 0; i < counters.length; i++) {
                    rowOffset += counters[i];
                }
                if (bestMatch >= 10) {
                    lgPatternFound |= 1 << (5 - x);
                }
            }

            this.__determineFirstDigit(resultString, lgPatternFound);

            var middleRange = UPCEANHelper.$static.findGuardPattern(row, rowOffset, true, UPCEANHelper.$static.MIDDLE_PATTERN);

            rowOffset = middleRange[1];

            for (var x = 0; x < 6 && rowOffset < end; x++) {
                var bestMatch = UPCEANHelper.$static.decodeDigit(row, counters, rowOffset, UPCEANHelper.$static.L_PATTERNS);
                resultString.append(String.fromCharCode(48 + bestMatch));

                for (var i = 0; i < counters.length; i++) {
                    rowOffset += counters[i];
                }
            }

            return rowOffset;
        },

        getBarcodeFormat : function () {
            return BarcodeFormat.$static.EAN_13;
        },

        __determineFirstDigit : function (resultString, lgPatternFound) {
            for (var d = 0; d < 10; d++) {
                if (lgPatternFound == this.$static.FIRST_DIGIT_ENCODINGS[d]) {
                    resultString.insert(0, String.fromCharCode(48 + d));
                    return;
                }
            }

            throw new NotFoundException();
        }
    });

    return EAN13Reader;
});