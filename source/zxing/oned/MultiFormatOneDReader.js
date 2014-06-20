define([
    'dejavu/FinalClass',
    'zxing/oned/OneDReader',
    'zxing/DecodeHintType',
    'zxing/BarcodeFormat',
    'zxing/oned/MultiFormatUPCEANReader',
    'zxing/oned/Code39Reader',
    'zxing/oned/Code93Reader',
    'zxing/oned/Code128Reader',
    'zxing/oned/ITFReader',
    'zxing/oned/CodaBarReader',
    'mout/lang/isArray',
    'mout/lang/isObject'
], function (FinalClass, OneDReader, DecodeHintType, BarcodeFormat, MultiFormatUPCEANReader, Code39Reader, Code93Reader, Code128Reader, ITFReader, CodaBarReader, isArray, isObject) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var MultiFormatOneDReader = FinalClass.declare({
        $name : 'zxing/oned/MultiFormatOneDReader',
        $extends : OneDReader,

        __readers : null,

        initialize : function (hints) {
            var possibleFormats = isObject(hints) ? hints[DecodeHintType.$static.POSSIBLE_FORMATS] : null;
            var useCode39CheckDigit = isObject(hints) ? true === hints[DecodeHintType.$static.$ASSUME_CODE_39_CHECK_DIGIT] : false;
            var readers = new Array();

            if (isArray(possibleFormats)) {
                if (contains(possibleFormats, BarcodeFormat.$static.EAN_13) ||
                    contains(possibleFormats, BarcodeFormat.$static.UPC_A) ||
                    contains(possibleFormats, BarcodeFormat.$static.EAN_8) ||
                    contains(possibleFormats, BarcodeFormat.$static.UPC_E)) {
                    readers.push(new MultiFormatUPCEANReader(hints));
                }

                if (contains(possibleFormats, BarcodeFormat.$static.CODE_39)) {
                    readers.push(new Code39Reader(useCode39CheckDigit));
                }

                if (contains(possibleFormats, BarcodeFormat.$static.CODE_93)) {
                    readers.push(new Code93Reader());
                }

                if (contains(possibleFormats, BarcodeFormat.$static.CODE_128)) {
                    readers.push(new Code128Reader());
                }

                if (contains(possibleFormats, BarcodeFormat.$static.ITF)) {
                    readers.push(new ITFReader());
                }

                if (contains(possibleFormats, BarcodeFormat.$static.CODABAR)) {
                    readers.push(new CodaBarReader());
                }
            }

            if (0 === readers.length) {
                readers.push(new MultiFormatUPCEANReader(hints));
                readers.push(new Code39Reader());
                readers.push(new CodaBarReader());
                readers.push(new Code93Reader());
                readers.push(new Code128Reader());
                readers.push(new ITFReader());
            }

            this.__readers = readers;
        },

        decodeRow : function (rowNumber, row, hints) {
            for (var i = 0; i < this.__readers.length; i++) {
                try {
                    return this.__readers[i].decodeRow(rowNumber, row, hints);
                } catch (e) {
                    // continue
                }
            }

            throw new NotFoundException();
        },

        reset : function () {
            for (var i = 0; i < this.__readers.length; i++) {
                this.__readers[i].reset();
            }
        }
    });

    return MultiFormatOneDReader;
});