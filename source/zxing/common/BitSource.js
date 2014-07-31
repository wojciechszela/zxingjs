define([
    'dejavu/FinalClass',
    'zxing/exception/IllegalArgumentException'
], function (FinalClass, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var BitSource = FinalClass.declare({
        $name: 'zxing/common/BitSource',

        __bytes : null,

        __byteOffset : 0,

        __bitOffset : 0,

        initialize : function (bytes) {
            this.__bytes = bytes;
        },

        getBitOffset : function () {
            return this.__bitOffset;
        },

        getByteOffset : function () {
            return this.__byteOffset;
        },

        readBits : function (numBits) {
            if (numBits < 1 || numBits > 32 || numBits > this.available()) {
                throw new IllegalArgumentException();
            }

            var result = 0;

            if (this.__bitOffset > 0) {
                var bitsLeft = 8 - this.__bitOffset;
                var toRead = numBits < bitsLeft ? numBits : bitsLeft;
                var bitsToNotRead = bitsLeft - toRead;
                var mask = (0xFF >> (8 - toRead)) << bitsToNotRead;
                result = (this.__bytes[this.__byteOffset] & mask) >> bitsToNotRead;
                numBits -= toRead;
                this.__bitOffset += toRead;
                if (this.__bitOffset == 8) {
                    this.__bitOffset = 0;
                    this.__byteOffset++;
                }
            }

            if (numBits > 0) {
                while (numBits >= 8) {
                    result = (result << 8) | (this.__bytes[this.__byteOffset] & 0xFF);
                    this.__byteOffset++;
                    numBits -= 8;
                }

                if (numBits > 0) {
                    var bitsToNotRead = 8 - numBits;
                    var mask = (0xFF >> bitsToNotRead) << bitsToNotRead;
                    result = (result << numBits) | ((this.__bytes[this.__byteOffset] & mask) >> bitsToNotRead);
                    this.__bitOffset += numBits;
                }
            }

            return result;
        },

        available : function () {
            return 8 * (this.__bytes.length - this.__byteOffset) + this.__bitOffset;
        }
    });

    return BitSource;
});