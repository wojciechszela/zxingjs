define([
    'dejavu/FinalClass',
    'zxing/qrcode/decoder/BitMatrixParser',
    'zxing/qrcode/decoder/DataBlock',
    'zxing/qrcode/decoder/DecodedBitStreamParser',
    'zxing/qrcode/decoder/QRCodeDecoderMetaData',
    'zxing/common/BitMatrix',
    'zxing/common/DecoderResult',
    'zxing/common/reedsolomon/GenericGF',
    'zxing/common/reedsolomon/ReedSolomonDecoder',
    'zxing/common/reedsolomon/ReedSolomonException',
    'zxing/exception/ChecksumException',
    'zxing/exception/FormatException'
], function (FinalClass, BitMatrixParser, DataBlock, DecodedBitStreamParser, QRCodeDecoderMetaData, BitMatrix, DecoderResult, GenericGF, ReedSolomonDecoder, ReedSolomonException, ChecksumException, FormatException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Decoder = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/Decoder',

        __rsDecoder : 0,

        initialize : function () {
            this.__rsDecoder = new ReedSolomonDecoder(new GenericGF(GenericGF.$static.QR_CODE_FIELD_256));
        },

        decode : function (image, hints) {
            if (image instanceof BitMatrix) {
                return this.__decodeBitMatrix(image, hints);
            } else if (image instanceof BitMatrixParser) {
                return this.__decodeBitMatrixParser(image, hints);
            } else {
                return this.__decodeArray(image, hints);
            }
        },

        __decodeArray : function (image, hints) {
            var dimension = image.width;
            var bits = new BitMatrix(dimension);
            for (var i = 0; i < dimension; i++) {
                for (var j = 0; j < dimension; j++) {
                    if (image[i][j]) {
                        bits.set(j, i);
                    }
                }
            }
            return decode(bits, hints);
        },

        __decodeBitMatrix : function (bits, hints) {
            var parser = new BitMatrixParser(bits);
            var fe = null;
            var ce = null;

            try {
                return this.__decodeBitMatrixParser(parser, hints);
            } catch (e) {
                if (e instanceof FormatException) {
                    fe = e;
                } else if (e instanceof ChecksumException) {
                    ce = e;
                } else {
                    throw e;
                }
            }

            try {
                parser.remask();
                parser.setMirror(true);
                parser.readVersion();
                parser.readFormatInformation();
                parser.mirror();

                var result = this.__decodeBitMatrixParser(parser, hints);

                result.setOther(new QRCodeDecoderMetaData(true));

                return result;
            } catch (e) {
                if (e instanceof FormatException) {
                    if (fe != null) {
                        throw fe;
                    } else {
                        throw e;
                    }
                } else if (e instanceof ChecksumException) {
                    if (ce != null) {
                        throw ce;
                    } else {
                        throw e;
                    }
                } else {
                    throw e;
                }
            }
        },

        __decodeBitMatrixParser : function (parser, hints) {
            var version = parser.readVersion();
            var ecLevel = parser.readFormatInformation().getErrorCorrectionLevel();

            var codewords = parser.readCodewords();
            var dataBlocks = DataBlock.$static.getDataBlocks(codewords, version, ecLevel);

            var totalBytes = 0;
            for (var _i = 0; _i < dataBlocks.length; _i++) {
                totalBytes += dataBlocks[_i].getNumDataCodewords();
            }

            var resultBytes = new Uint8Array(totalBytes);
            var resultOffset = 0;

            for (var _i = 0; _i < dataBlocks.length; _i++) {
                var dataBlock = dataBlocks[_i];
                var codewordBytes = dataBlock.getCodewords();
                var numDataCodewords = dataBlock.getNumDataCodewords();
                this.__correctErrors(codewordBytes, numDataCodewords);
                for (var i = 0; i < numDataCodewords; i++) {
                    resultBytes[resultOffset++] = codewordBytes[i];
                }
            }

            return DecodedBitStreamParser.$static.decode(resultBytes, version, ecLevel, hints);
        },

        __correctErrors : function (codewordBytes, numDataCodewords) {
            var numCodewords = codewordBytes.length;
            var codewordsInts = new Uint32Array(numCodewords);
            for (var i = 0; i < numCodewords; i++) {
                codewordsInts[i] = codewordBytes[i] & 0xFF;
            }
            var numECCodewords = codewordBytes.length - numDataCodewords;
            try {
                this.__rsDecoder.decode(codewordsInts, numECCodewords);
            } catch (e) {
                if (e instanceof ReedSolomonException) {
                    throw new ChecksumException();
                } else {
                    throw e;
                }
            }

            for (var i = 0; i < numDataCodewords; i++) {
                codewordBytes[i] = codewordsInts[i];
            }
        }
    });

    return Decoder;
});