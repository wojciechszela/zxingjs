define([
    'dejavu/FinalClass',
    'zxing/BarcodeFormat',
    'zxing/Result',
    'zxing/ResultPoint',
    'zxing/ResultMetadataType',
    'zxing/oned/UPCEANHelper',
    'zxing/exception/NotFoundException',
    'zxing/lang/StringBuilder',
    'mout/array/intersection'
], function (FinalClass, BarcodeFormat, Result, ResultPoint, ResultMetadataType, UPCEANHelper, NotFoundException, StringBuilder, intersection) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var UPCEANExtension5Support = FinalClass.declare({
        $name : 'zxing/oned/UPCEANExtension5Support',

        $finals : {
            $statics : {
                CHECK_DIGIT_ENCODINGS : new Uint32Array([0x18, 0x14, 0x12, 0x11, 0x0C, 0x06, 0x03, 0x0A, 0x09, 0x05])
            }
        },

        decodeRow : function (rowNumber, row, extensionStartRange) {
            var resultString = new StringBuilder();
            var end = this.decodeMiddle(row, extensionStartRange, resultString);

            var extensionData = this.__parseExtensionString(resultString);

            var extensionResult = new Result(
                resultString,
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

            var lgPatternFound = 0;

            for (var x = 0; x < 5 && rowOffset < end; x++) {
                var bestMatch = UPCEANHelper.$static.decodeDigit(row, counters, rowOffset, UPCEANHelper.$static.L_AND_G_PATTERNS);
                resultString.append(String.fromCharCode(48 + bestMatch % 10));

                for (var i = 0; i < counters.length; i++) {
                    rowOffset += counters[i];
                }

                if (bestMatch >= 10) {
                    checkParity |= 1 << (4 - x);
                }

                if (x != 4) {
                    rowOffset = row.getNextSet(rowOffset);
                    rowOffset = row.getNextUnset(rowOffset);
                }
            }

            if (resultString.length() != 5) {
                throw new NotFoundException();
            }

            var checkDigit = this.__determineCheckDigit(lgPatternFound);
            if (this.__extensionChecksum(resultString) !== checkDigit) {
                throw new NotFoundException();
            }

            return rowOffset;
        },

        __extensionChecksum : function (resultString) {
            var s = resultString.toString();
            var length = s.length;
            var sum = 0;
            for (var i = length - 2; i >= 0; i -= 2) {
                sum += s.charCodeAt(i) - 48;
            }
            for (i = length - 1; i >= 0; i-= 2) {
                sum += s.charCodeAt(i) - 48;
            }
            sum *= 3;
            return sum % 10;
        },

        __determineCheckDigit : function (lgPatternFound) {
            for (var d = 0; d < 10; d++) {
                if (intersection(lgPatternFound, this.$static.CHECK_DIGIT_ENCODINGS[d]).length === lgPatternFound.length) {
                    return d;
                }
            }

            throw new NotFoundException();
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

    return UPCEANExtension5Support;
});