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
    var UPCEReader = FinalClass.declare({
        $name : 'zxing/oned/UPCEReader',
        $extends : UPCEANReader,

        $statics : {
            MIDDLE_END_PATTERN : new Uint32Array([1, 1, 1, 1, 1, 1]),

            NUMSYS_AND_CHECK_DIGIT_PATTERNS : new Array(
                new Uint32Array([0x38, 0x34, 0x32, 0x31, 0x2C, 0x26, 0x23, 0x2A, 0x29, 0x25]),
                new Uint32Array([0x07, 0x0B, 0x0D, 0x0E, 0x13, 0x19, 0x1C, 0x15, 0x16, 0x1A])
            )
        },

        decodeMiddle : function (row, startRange, result) {
            var counters = new Uint32Array(4);
            var end = row.getSize();
            var rowOffset = startRange[1];

            var lgPatternFound = 0;

            for (var x = 0; x < 6 && rowOffset < end; x++) {
                var bestMatch = UPCEANHelper.$static.decodeDigit(row, counters, rowOffset, UPCEANHelper.$static.L_AND_G_PATTERNS);
                result.append(String.fromCharCode(48 + bestMatch % 10));

                for (var i = 0; i < counters.length; i++) {
                    rowOffset += counters[i];
                }

                if (bestMatch >= 10) {
                    lgPatternFound |= 1 << (5 - x);
                }
            }

            this.__determineNumSysAndCheckDigit(result, lgPatternFound);

            return rowOffset;
        },

        decodeEnd : function (row, endStart) {
            return UPCEANHelper.$static.findGuardPattern(row, endStart, true, this.$static.MIDDLE_END_PATTERN);
        },

        checkChecksum : function (s) {
            return this.$super(this.convertUPCEtoUPCA(s));
        },

        __determineNumSysAndCheckDigit : function (resultString, lgPatternFound) {
            for (var numSys = 0; numSys <= 1; numSys++) {
                for (var d = 0; d < 10; d++) {
                    if (lgPatternFound == this.$static.NUMSYS_AND_CHECK_DIGIT_PATTERNS[numSys][d]) {
                        resultString.insert(0, String.fromCharCode(48 + numSys));
                        resultString.append(String.fromCharCode(48 + d));
                        return;
                    }
                }
            }

            throw new NotFoundException();
        },

        getBarcodeFormat : function () {
            return BarcodeFormat.$static.UPC_E;
        },

        convertUPCEtoUPCA : function (upce) {
            var upceChars = upce.substring(1, 7).split('');
            var result = upce.charAt(0);
            var lastChar = upceChars[5];

            switch (lastChar) {
                case '0':
                case '1':
                case '2':
                    result += upceChars.slice(0, 2).join('');
                    result += lastChar;
                    result += '0000';
                    result += upceChars.slice(2, 2 + 3).join('');
                    break;
                case '3':
                    result += upceChars.slice(0, 3).join();
                    result += '0000';
                    result += upceChars.slice(3, 3 + 2).join('');
                    break;
                case '4':
                    result += upceChars.slice(0, 4).join('');
                    result += '0000';
                    result += upceChars[4];
                    break;
                default:
                    result += upceChars.slice(0, 5).join('');
                    result += '0000';
                    result += lastChar;
            }

            result += upce.charAt(7);

            return result;

        }
    });

    return UPCEReader;
});