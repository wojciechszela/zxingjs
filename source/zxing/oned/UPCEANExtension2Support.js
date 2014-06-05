define([
    'dejavu/FinalClass',
    'zxing/BarcodeFormat',
    'zxing/Result',
    'zxing/ResultPoint',
    'zxing/ResultMetadataType',
    'zxing/oned/UPCEANHelper',
    'zxing/exception/NotFoundException',
    'zxing/lang/StringBuilder'
], function (FinalClass, BarcodeFormat, Result, ResultPoint, ResultMetadataType, UPCEANHelper, NotFoundException, StringBuilder) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var UPCEANExtension2Support = FinalClass.declare({
        $name : 'zxing/oned/UPCEANExtension2Support',

        decodeRow : function (rowNumber, row, extensionStartRange) {
            var resultString = new StringBuilder();
            var end = this.decodeMiddle(row, extensionStartRange, resultString);

            var extensionData = this.__parseExtensionString(resultString);

            var extensionResult = new Result(
                resultString.toString(),
                null,
                [
                    new ResultPoint((extensionStartRange[0] + extensionStartRange[1]) / 2.0, rowNumber * 1.0),
                    new ResultPoint(end * 1.0, rowNumber * 1.0)
                ],
                BarcodeFormat.$static.UPC_EAN_EXTENSION
            );

            if (extensionData !== null) {
                extensionResult.putAllMetadata(extensionData);
            }

            return extensionResult;
        },

        decodeMiddle : function (row, startRange, resultString) {
            var counters = new Uint32Array(4);
            var end = row.getSize();
            var rowOffset = startRange[1];

            var checkParity = 0;

            for (var x = 0; x < 2 && rowOffset < end; x++) {
                var bestMatch = UPCEANHelper.$static.decodeDigit(row, counters, rowOffset, UPCEANHelper.$static.L_AND_G_PATTERNS);
                resultString.append(String.fromCharCode(48 + bestMatch % 10));

                for (var i = 0; i < counters.length; i++) {
                    rowOffset += counters[i];
                }

                if (bestMatch >= 10) {
                    checkParity |= 1 << (1 - x);
                }

                if (x != 1) {
                    rowOffset = row.getNextSet(rowOffset);
                    rowOffset = row.getNextUnset(rowOffset);
                }
            }

            if (resultString.length() != 2) {
                throw new NotFoundException();
            }

            if (parseInt(resultString.toString()) % 4 != checkParity) {
                throw new NotFoundException();
            }

            return rowOffset;
        },

        __parseExtensionString : function (raw) {
            if (raw.length() != 2) {
                return null;
            }

            var result = {};
            result[ResultMetadataType.$static.ISSUE_NUMBER] = parseInt(raw.toString());
            return result;
        }
    });

    return UPCEANExtension2Support;
});