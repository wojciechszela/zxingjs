define([
    'dejavu/FinalClass',
    'zxing/oned/UPCEANReader',
    'zxing/oned/EAN13Reader',
    'zxing/BarcodeFormat',
    'zxing/Result',
    'zxing/exception/FormatException'
], function (FinalClass, UPCEANReader, EAN13Reader, BarcodeFormat, Result, FormatException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var UPCAReader = FinalClass.declare({
        $name : 'zxing/oned/UPCAReader',
        $extends : UPCEANReader,

        __ean13Reader : null,

        initialize : function () {
            this.$super();
            __ean13Reader : new EAN13Reader();
        },

        decodeRowAt : function (rowNumber, row, startGuardRange, hints) {
            return this.__maybeReturnResult(this.__ean13Reader.decodeRowAt(rowNumber, row, startGuardRange, hints));
        },

        decodeRow : function (rowNumber, row, hints) {
            return this.__maybeReturnResult(this.__ean13Reader.decodeRow(rowNumber, row, hints));
        },

        decode : function (image, hints) {
            return this.__maybeReturnResult(this.__ean13Reader.decode(image, hints));
        },

        getBarcodeFormat : function () {
            return BarcodeFormat.$static.UPC_A;
        },

        decodeMiddle : function (row, startRange, resultString) {
            return this.__ean13Reader.decodeMiddle(row, startRange, resultString);
        },

        __maybeReturnResult : function (result) {
            var text = result.getText();

            if (text.charAt(0) == '0') {
                return new Result(text.substring(1), null, result.getResultPoints(), BarcodeFormat.$static.UPC_A);
            } else {
                throw new FormatException();
            }
        }
    });

    return UPCAReader;
});