define([
    'dejavu/FinalClass',
    'zxing/BarcodeFormat',
    'zxing/DecodeHintType',
    'zxing/Result',
    'zxing/oned/OneDReader',
    'zxing/oned/EAN8Reader',
    'zxing/oned/EAN13Reader',
    'zxing/oned/UPCAReader',
    'zxing/oned/UPCEReader',
    'zxing/oned/UPCEANReader',
    'zxing/oned/UPCEANHelper',
    'zxing/exception/NotFoundException',
    'mout/lang/isArray',
    'mout/array/contains'
], function (FinalClass, BarcodeFormat, DecodeHintType, Result, OneDReader, EAN8Reader, EAN13Reader, UPCAReader, UPCEReader, UPCEANReader, UPCEANHelper, NotFoundException, isArray, contains) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var MultiFormatUPCEANReader = FinalClass.declare({
        $name : 'zxing/oned/MultiFormatUPCEANReader',
        $extends : OneDReader,

        __readers : null,

        initialize : function (hints) {
            var possibleFormats = (hints instanceof DecodeHintType) ? hints.get(DecodeHintType.$static.POSSIBLE_FORMATS) : null;
            var readers = new Array();

            if (isArray(possibleFormats)) {
                if (contains(possibleFormats, BarcodeFormat.$static.EAN_13)) {
                    readers.push(new EAN13Reader());
                } else if (contains(possibleFormats, BarcodeFormat.$static.UPC_A)) {
                    readers.push(new UPCAReader());
                }

                if (contains(possibleFormats, BarcodeFormat.$static.EAN_8)) {
                    readers.push(new EAN8Reader());
                }

                if (contains(possibleFormats, BarcodeFormat.$static.UPC_E)) {
                    readers.push(new UPCEReader());
                }
            }

            if (0 === readers.length) {
                readers.push(new EAN13Reader());
                readers.push(new EAN8Reader());
                readers.push(new UPCEReader());
            }

            this.__readers = readers;
        },

        decodeRow : function (rowNumber, row, hints) {
            var startGuardPattern = UPCEANHelper.$static.findStartGuardPattern(row);

            for (var i = 0; i < this.__readers.length; i++) {
                var reader = this.__readers[i];
                var result = null;

                try {
                    result = reader.decodeRowAt(rowNumber, row, startGuardPattern, hints);
                } catch (e) {
                    continue;
                }

                var ean13MayBeUPCA = result.getBarcodeFormat() === BarcodeFormat.$static.EAN_13 && result.getText().charAt(0) == '0';
                var possibleFormats = (hints instanceof DecodeHintType) ? hints.get(DecodeHintType.$static.POSSIBLE_FORMATS) : null;
                var canReturnUPCA = isArray(possibleFormats) ? contains(possibleFormats, BarcodeFormat.$static.UPC_A) : false;

                if (ean13MayBeUPCA && canReturnUPCA) {
                    var resultUPCA = new Result(
                        result.getText().substring(1),
                        result.getRawBytes(),
                        result.getResultPoints(),
                        BarcodeFormat.$static.UPC_A
                    );
                    resultUPCA.putAllMetadata(result.getResultMetadata());
                    return resultUPCA;
                }

                return result;
            }

            throw new NotFoundException();
        },

        reset : function () {
            for (var i = 0; i < this.__readers.length; i++) {
                this.__readers[i].reset();
            }
        }
    });

    return MultiFormatUPCEANReader;
});