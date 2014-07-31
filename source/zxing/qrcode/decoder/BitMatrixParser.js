define([
    'dejavu/FinalClass',
    'zxing/exception/FormatException',
    'zxing/qrcode/decoder/FormatInformation',
    'zxing/qrcode/decoder/Version',
    'zxing/qrcode/decoder/DataMask'
], function (FinalClass, FormatException, FormatInformation, Version, DataMask) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var BitMatrixParser = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/BitMatrixParser',

        __bitMatrix : null,

        __parsedVersion : null,

        __parsedFormatInfo : null,

        __mirror : false,

        initialize : function (bitMatrix) {
            var dimension = bitMatrix.getHeight();
            if (dimension < 21 || (dimension & 0x03) != 1) {
                throw new FormatException();
            }
            this.__bitMatrix = bitMatrix;
        },

        readFormatInformation : function () {
            if (null !== this.__parsedFormatInfo) {
                return this.__parsedFormatInfo;
            }

            var formatInfoBits1 =  0;
            for (var i = 0; i < 6; i++) {
                formatInfoBits1 = this.__copyBit(i, 8, formatInfoBits1);
            }

            formatInfoBits1 = this.__copyBit(7, 8, formatInfoBits1);
            formatInfoBits1 = this.__copyBit(8, 8, formatInfoBits1);
            formatInfoBits1 = this.__copyBit(8, 7, formatInfoBits1);

            for (var j = 5; j >= 0; j--) {
                formatInfoBits1 = this.__copyBit(8, j, formatInfoBits1);
            }

            var dimension = this.__bitMatrix.getHeight();
            var formatInfoBits2 = 0;
            var jMin = dimension - 7;
            for (var j = dimension - 1; j >= jMin; j--) {
                formatInfoBits2 = this.__copyBit(8, j, formatInfoBits2);
            }
            for (var i = dimension - 8; i < dimension; i++) {
                formatInfoBits2 = this.__copyBit(i, 8, formatInfoBits2);
            }

            this.__parsedFormatInfo = FormatInformation.$static.decodeFormatInformation(formatInfoBits1, formatInfoBits2);
            if (this.__parsedFormatInfo !== null) {
                return this.__parsedFormatInfo;
            }
            throw new FormatException();
        },

        readVersion : function () {
            if (null !== this.__parsedVersion) {
                return this.__parsedVersion;
            }

            var dimension = this.__bitMatrix.getHeight();

            var provisionalVersion = Math.floor((dimension - 17) / 4);
            if (provisionalVersion <= 6) {
                return Version.$static.getVersionForNumber(provisionalVersion);
            }

            var versionBits = 0;
            var ijMin = dimension - 11;
            for (var j = 5; j >= 0; j--) {
                for (var i = dimension - 9; i >= ijMin; i--) {
                    versionBits = this.__copyBit(i, j, versionBits);
                }
            }

            var theParsedVersion = Version.$static.decodeVersionInformation(versionBits);
            if (theParsedVersion !== null && theParsedVersion.getDimensionForVersion() == dimension) {
                this.__parsedVersion = theParsedVersion;
                return theParsedVersion;
            }

            versionBits = 0;
            for (var i = 5; i >= 0; i--) {
                for (var j = dimension -9; j >= ijMin; j--) {
                    versionBits = this.__copyBit(i, j, versionBits);
                }
            }

            theParsedVersion = Version.$static.decodeVersionInformation(versionBits);
            if (theParsedVersion !== null && theParsedVersion.getDimensionForVersion() == dimension) {
                this.__parsedVersion = theParsedVersion;
                return theParsedVersion;
            }

            throw new FormatException();
        },

        __copyBit : function (i, j, versionBits) {
            var bit = this.__mirror ? this.__bitMatrix.get(j, i) : this.__bitMatrix.get(i, j);
            return bit ? (versionBits << 1) | 0x01 : versionBits << 1;
        },

        readCodewords : function () {
            var formatInfo = this.readFormatInformation();
            var version = this.readVersion();

            var dataMask = DataMask.$static.forReference(formatInfo.getDataMask());
            var dimension = this.__bitMatrix.getHeight();
            dataMask.unmaskBitMatrix(this.__bitMatrix, dimension);

            var functionPattern = version.buildFunctionPattern();

            var readingUp = true;
            var result = new Uint8Array(version.getTotalCodewords());
            var resultOffset = 0;
            var currentByte = 0;
            var bitsRead = 0;

            for (var j = dimension - 1; j > 0; j -= 2) {
                if (j == 6) {
                    j--;
                }

                for (var count = 0; count < dimension; count++) {
                    var i = readingUp ? dimension - 1 - count : count;
                    for (var col = 0; col < 2; col++) {
                        if (!functionPattern.get(j - col, i)) {
                            bitsRead++;
                            currentByte = currentByte << 1;
                            if (this.__bitMatrix.get(j - col, i)) {
                                currentByte |= 1;
                            }

                            if (bitsRead == 8) {
                                result[resultOffset++] = currentByte;
                                bitsRead = 0;
                                currentByte = 0;
                            }
                        }
                    }
                }
                readingUp = !readingUp;
            }

            if (resultOffset != version.getTotalCodewords()) {
                throw new FormatException();
            }

            return result;
        },

        remask : function () {
            if (this.__parsedFormatInfo === null) {
                return;
            }

            var dataMask = DataMask.$static.forReference(this.__parsedFormatInfo.getDataMask());
            var dimension = this.__bitMatrix.getHeight();
            dataMask.unmaskBitMatrix(this.__bitMatrix, dimension);
        },

        setMirror : function (mirror) {
            this.__parsedVersion = null;
            this.__parsedFormatInfo = null;
            this.__mirror = mirror;
        },

        mirror : function () {
            for (var x = 0; x < this.__bitMatrix.getWidth(); x++) {
                for (var y = x + 1; y < this.__bitMatrix.getHeight(); y++) {
                    if (this.__bitMatrix.get(x, y) != this.__bitMatrix.get(y, x)) {
                        this.__bitMatrix.flip(y, x);
                        this.__bitMatrix.flip(x, y);
                    }
                }
            }
        }
    });

    return BitMatrixParser;
});