define([
    'dejavu/Class',
    'zxing/Reader',
    'zxing/DecodeHintType',
    'zxing/Result',
    'zxing/BarcodeFormat',
    'zxing/ResultMetadataType',
    'zxing/common/BitMatrix',
    'zxing/qrcode/decoder/Decoder',
    'zxing/qrcode/decoder/QRCodeDecoderMetaData',
    'zxing/qrcode/detector/Detector',
    'zxing/exception/NotFoundException',
    'mout/object/hasOwn',
    'mout/lang/isObject'
], function (Class, Reader, DecodeHintType, Result, BarcodeFormat, ResultMetadataType, BitMatrix, Decoder, QRCodeDecoderMetaData, Detector, NotFoundException, hasOwn, isObject) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var QRCodeReader = Class.declare({
        $name : 'zxing/qrcode/QRCodeReader',

        __decoder : new Decoder(),

        $finals : {
            _getDecoder : function () {
                return this.__decoder;
            }
        },

        decode : function (image, hints) {
            var decoderResult;
            var points;
            if (isObject(hints) && hasOwn(hints, DecodeHintType.$static.PURE_BARCODE)) {
                var bits = this.$static.extractPureBits(image.getBlackMatrix());
                decoderResult = this.__decoder.decode(bits, hints);
                points = [];
            } else {
                var detectorResult = new Detector(image.getBlackMatrix()).detect(hints);
                decoderResult = this.__decoder.decode(detectorResult.getBits(), hints);
                points = detectorResult.getPoints();
            }

            if (decoderResult.getOther() instanceof QRCodeDecoderMetaData) {
                decoderResult.getOther().applyMirroredCorrection(points);
            }

            var result = new Result(decoderResult.getText(), decoderResult.getRawBytes(), points, BarcodeFormat.$static.QR_CODE);
            var byteSegments = decoderResult.getByteSegments();
            if (null != byteSegments) {
                result.putMetadata(ResultMetadataType.$static.BYTE_SEGMENTS, byteSegments);
            }
            var ecLevel = decoderResult.getECLevel();
            if (null != ecLevel) {
                result.putMetadata(ResultMetadataType.$static.ERROR_CORRECTION_LEVEL, ecLevel);
            }
            if (decoderResult.hasStructuredAppend()) {
                result.putMetadata(ResultMetadataType.$static.STRUCTURED_APPEND_SEQUENCE, decoderResult.getStructuredAppendSequenceNumber());
                result.putMetadata(ResultMetadataType.$static.STRUCTURED_APPEND_PARITY, decoderResult.getStructuredAppendParity());
            }
            return result;
        },

        reset : function () {

        },

        $statics : {
            extractPureBits : function (image) {
                var leftTopBlack = image.getTopLeftOnBit();
                var rightBottomBlack = image.getBottomRightOnBit();
                if (leftTopBack == null || rightBottomBlack == null) {
                    throw new NotFoundException();
                }

                var moduleSize = this.$static.moduleSize(leftTopBlack, image);

                var top = leftTopBlack[1];
                var bottom = rightBottomBlack[1];
                var left = leftTopBlack[0];
                var right = rightBottomBlack[0];

                if (left >= right || top >= bottom) {
                    throw new NotFoundException();
                }

                if (bottom - top != right - left) {
                    right = left + (bottom - top);
                }

                var matrixWidth = Math.round((right - left + 1) / moduleSize);
                var matrixHeight = Math.round((bottom - top + 1) / moduleSize);
                if (matrixWidth <= 0 || matrixHeight <= 0) {
                    throw new NotFoundException();
                }

                if (matrixHeight != matrixWidth) {
                    throw new NotFoundException();
                }

                var nudge = Math.floor(moduleSize / 2.0);
                top += nudge;
                left += nudge;

                var nudgedTooFarRight = left + Math.floor((matrixWidth - 1) * moduleSize) - (right - 1);
                if (nudgetTooFarRight > 0) {
                    if (nudgedTooFarRight > nudge) {
                        throw new NotFoundException();
                    }
                    top -= nudgedTooFarRight;
                }

                var bits = new BitMatrix(matrixWidth, matrixHeight);
                for (var y = 0; y < matrixHeight; y++) {
                    var iOffset = top + (y * moduleSize);
                    for (var x = 0; x < matrixWidth; x++) {
                        if (image.get(left + Math.floor(x * moduleSize), iOffset)) {
                            bits.set(x, y);
                        }
                    }
                }
                return bits;
            },

            moduleSize : function (leftTopBlack, image) {
                var height = image.getHeight();
                var width = image.getWidth();
                var x = leftTopBlack[0];
                var y = leftTopBlack[1];
                var inBlack = true;
                var transitions = 0;
                while (x < width && y < height) {
                    if (inBlack != image.get(x, y)) {
                        if (++transitions == 5) {
                            break;
                        }
                        inBlack = !inBlack;
                    }
                    x++;
                    y++;
                }
                if (x == width || y == height) {
                    throw new NotFoundException();
                }
                return (x - leftTopBlack[0]) / 7.0;
            }
        }
    });

    return QRCodeReader;
});