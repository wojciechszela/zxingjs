define([
    'dejavu/AbstractClass',
    'zxing/DecodeHintType',
    'zxing/Result',
    'zxing/ResultMetadataType',
    'zxing/ResultPoint',
    'zxing/BarcodeFormat',
    'zxing/oned/OneDReader',
    'zxing/oned/EANManufacturerOrgSupport',
    'zxing/oned/UPCEANExtensionSupport',
    'zxing/oned/UPCEANHelper',
    'zxing/exception/NotFoundException',
    'zxing/exception/FormatException',
    'zxing/exception/ChecksumException',
    'zxing/exception/ReaderException',
    'zxing/lang/StringBuilder',
    'zxing/lang/arrayCopy',
    'mout/lang/isObject',
    'mout/lang/isArray',
    'mout/object/hasOwn'
], function (AbstractClass, DecodeHintType, Result, ResultMetadataType, ResultPoint, BarcodeFormat, OneDReader, EANManufacturerOrgSupport, UPCEANExtensionSupport, UPCEANHelper, NotFoundException, FormatException, ChecksumException, ReaderException, StringBuilder, arrayCopy, isObject, isArray, hasOwn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var UPCEANReader = AbstractClass.declare({
        $name : 'zxing/oned/UPCEANReader',
        $extends : OneDReader,

        __extensionReader : null,

        __eanManSupport : null,

        initialize : function () {
            this.__extensionReader = new UPCEANExtensionSupport();
            this.__eanManSupport = new EANManufacturerOrgSupport();
        },

        decodeRow : function (rowNumber, row, hints) {
            return this.decodeRowAt(rowNumber, row, UPCEANHelper.$static.findStartGuardPattern(row), hints);
        },

        decodeRowAt : function (rowNumber, row, startGuardRange, hints) {
            var resultPointCallback = isObject(hints) && hasOwn(hints, DecodeHintType.$static.NEED_RESULT_POINT_CALLBACK) ? hints[DecodeHintType.$static.NEED_RESULT_POINT_CALLBACK] : null;

            if (resultPointCallback !== null) {
                resultPointCallback.foundPossibleResultPoint(new ResultPoint(
                    (startGuardRange[0] + startGuardRange[1]) / 2.0,
                    rowNumber
                ));
            }

            var result = new StringBuilder();

            var endStart = this.decodeMiddle(row, startGuardRange, result);

            if (resultPointCallback !== null) {
                resultPointCallback.foundPossibleResultPoint(new ResultPoint(
                    endStart, rowNumber
                ));
            }

            var endRange = this.decodeEnd(row, endStart);

            if (resultPointCallback !== null) {
                resultPointCallback.foundPossibleResultPoint(new ResultPoint(
                    (endRange[0] + endRange[1]) / 2.0,
                    rowNumber
                ));
            }

            var end = endRange[1];
            var quietEnd = end + (end - endRange[0]);
            if (quietEnd >= row.getSize() || !row.isRange(end, quietEnd, false)) {
                throw new NotFoundException();
            }

            if (result.length() < 8) {
                throw new FormatException();
            }

            if (!this.checkChecksum(result.toString())) {
                throw new ChecksumException();
            }

            var left = (startGuardRange[1] + startGuardRange[0]) / 2.0;
            var right = (endRange[1] + endRange[0]) / 2.0;
            var format = this.getBarcodeFormat();
            var decodeResult = new Result(
                result.toString(),
                null,
                [new ResultPoint(left, rowNumber + 0.0), new ResultPoint(right, rowNumber + 0.0)],
                format
            );

            var extensionLength = 0;

            try {
                var extensionResult = this.__extensionReader.decodeRow(rowNumber, row, endRange[1]);
                decodeResult.putMetadata(ResultMetadataType.$extension.UPC_EAN_EXTENSION, extensionResult.getText());
                decodeResult.putAllMetadata(extensionResult.getResultMetadata());
                decodeResult.addResultPoints(extensionResult.getResultPoints());
                extensionLength = extensionResult.getText().length;
            } catch (re) {
                if (!(re instanceof ReaderException)) {
                    throw re;
                }
            }

            var allowedExtensions = isObject(hints) && hasOwn(hints, DecodeHintType.$static.ALLOWED_EAN_EXTENSIONS) ? hints[DecodeHintType.$static.ALLOWED_EAN_EXTENSIONS] : null;

            if (isArray(allowedExtensions)) {
                var valid = false;
                for (var i = 0; i < allowedExtensions.length; i++) {
                    if (extensionLength == allowedExtensions[i]) {
                        valid = true;
                        break;
                    }
                }
                if (!valid) {
                    throw new NotFoundException();
                }
            }

            if (format === BarcodeFormat.$static.EAN_13 || format === BarcodeFormat.$static.UPC_A) {
                var countryID = this.__eanManSupport.lookupCountryIdentifier(result.toString());
                if (countryID !== null) {
                    decodeResult.putMetadata(ResultMetadataType.$static.POSSIBLE_COUNTRY, countryID);
                }
            }

            return decodeResult;
        },

        checkChecksum : function (s) {
            return this.checkStandardUPSEANChecksum(s);
        },

        checkStandardUPSEANChecksum : function (s) {
            var length = s.length;
            if (length === 0) {
                return false;
            }

            var sum = 0;
            for (var i = length - 2; i >= 0; i -= 2) {
                var digit = s.charCodeAt(i) - 48; // 48 === '0'.charCodeAt(0);
                if (digit < 0 || digit > 9) {
                    throw new FormatException();
                }
                sum += digit;
            }
            sum *= 3;
            for (var i = length - 1; i >= 0; i -= 2) {
                var digit = s.charCodeAt(i) - 48; // 48 === '0'.charCodeAt(0);
                if (digit < 0 || digit > 9) {
                    throw new FormatException();
                }
                sum += digit;
            }

            return sum % 10 === 0;
        },

        decodeEnd : function (row, endStart) {
            return UPCEANHelper.$static.findGuardPattern(row, endStart, false, UPCEANHelper.$static.START_END_PATTERN);
        },

        $abstracts : {
            getBarcodeFormat : function () {},

            decodeMiddle : function (row, startRange, resultString) {}
        }
    });

    return UPCEANReader;
});