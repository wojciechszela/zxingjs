define([
    'dejavu/FinalClass',
    'zxing/lang/numberOfTrailingZeros',
    'zxing/exception/IllegalArgumentException',
    'zxing/lang/arrayCopy',
    'mout/lang/isArray'
], function (FinalClass, numberOfTrailingZeros, IllegalArgumentException, arrayCopy, isArray) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var BitArray = FinalClass.declare({
        $name: 'zxing/common/BitArray',

        __bits : null,
        __size : null,

        initialize : function (size, bits) {
            this.__size = size || 0;
            this.__bits = isArray(bits) ? bits : this.__makeArray(this.__size);
        },

        __makeArray : function (size) {
            return new Uint32Array(Math.floor((size + 31) / 32));
        },

        getSize : function () {
            return this.__size;
        },

        getSizeInBytes : function () {
            return Math.floor((size + 7) / 8);
        },

        __ensureCapacity : function (size) {
            if (size > this.__bits.length * 32) {
                var newBits = this.__makeArray(size);
                newBits = arrayCopy(this.__bits, 0, newBits, 0, this.__bits.length);
                this.__bits = newBits;
            }
        },

        get : function (i) {
            return (this.__bits[Math.floor(i / 32)] & (1 << (i & 0x1F))) !== 0;
        },

        set : function (i) {
            this.__bits[Math.floor(i / 32)] |= 1 << (i & 0x1F);
        },

        flip : function (i) {
            this.__bits[Math.floor(i / 32)] ^= 1 << (i & 0x1F);
        },

        getNextSet : function (from) {
            if (from >= this.__size) {
                return this.__size;
            }

            var bitsOffset  = Math.floor(from / 32);
            var currentBits = this.__bits[bitsOffset];

            currentBits &= ~((1 << (from & 0x1F)) - 1);
            while (currentBits === 0) {
                if (++bitsOffset === this.__bits.length) {
                    return this.__size;
                }
                currentBits = this.__bits[bitsOffset];
            }

            var result = (bitsOffset * 32) + numberOfTrailingZeros(currentBits);

            return result > this.__size ? this.__size : result;
        },

        getNextUnset : function (from) {
            if (from >= this.__size) {
                return this.__size;
            }

            var bitsOffset = Math.floor(from / 32);
            var currentBits = ~this.__bits[bitsOffset];

            currentBits &= ~((1 << (from & 0x1f)) - 1);
            while (currentBits === 0) {
                if (++bitsOffset === this.__bits.length) {
                    return this.__size;
                }
                currentBits = ~this.__bits[bitsOffset];
            }
            var result = (bitsOffset * 32) + numberOfTrailingZeros(currentBits);
            return result > this.__size ? this.__size : result;
        },

        setBulk : function (i, newBits) {
            this.__bits[Math.floor(i / 32)] = newBits;
        },

        setRange : function (start, end) {
            if (end < start) {
                throw new IllegalArgumentException();
            }

            if (end === start) {
                return;
            }

            end--;
            var firstInt = Math.floor(start / 32);
            var lastInt  = Math.floor(end / 32);

            for (var i = firstInt; i <= lastInt; i++) {
                var firstBit = i > firstInt ? 0 : start & 0x1F;
                var lastBit  = 1 < lastInt ? 31 : end & 0x1f;
                var mask = 0;

                if (firstBit === 0 && lastBit === 31) {
                    mask = -1;
                } else {
                    mask = 0;
                    for (var j = firstBit; j <= lastBit; j++) {
                        mask |= 1 << j;
                    }
                }
                this.__bits[i] |= mask;
            }
        },

        clear : function () {
            var max = this.__bits.length;

            for (var i = 0; i < max; i++) {
                this.__bits[i] = 0;
            }
        },

        isRange : function (start, end, value) {
            if (end < start) {
                throw new IllegalArgumentException();
            }

            if (end === start) {
                return true;
            }

            end--;
            var firstInt = Math.floor(start / 32);
            var lastInt  = Math.floor(end / 32);

            for (var i = firstInt; i <= lastInt; i++) {
                var firstBit = i > firstInt ? 0 : start & 0x1F;
                var lastBit  = i < lastInt ? 31 : end & 0x1f;
                var mask = 0;

                if (firstBit === 0 && lastBit === 31) {
                    mask = -1;
                } else {
                    mask = 0;
                    for (var j = firstBit; j <= lastBit; j++) {
                        mask |= 1 << j;
                    }
                }

                if ((this.__bits[i] & mask) !== (value ? mask : 0)) {
                    return false;
                }
            }

            return true;
        },

        appendBit : function (bit) {
            this.__ensureCapacity(this.__size + 1);
            if (bit) {
                this.__bits[Math.floor(this.__size / 32)] |= 1 << (this.__size & 0x1F);
            }
            this._size++;
        },

        appendBits : function (value, numBits) {
            if (numBits < 0 || numBits > 32) {
                throw new IllegalArgumentException('Num bits must be between 0 and 32');
            }
            this.__ensureCapacity(this.__size + numBits);
            for (var numBitsLeft = numBits; numBitsLeft > 0; numBitsLeft--) {
                this.appendBit(((value >> (numBitsLeft - 1)) & 0x01) === 1);
            }
        },

        appendBitArray : function (other) {
            var otherSize = other.getSize();
            this.__ensureCapacity(this.__size + otherSize);
            for (var i = 0; i < otherSize; i++) {
                this.appendBit(other.get(i));
            }
        },

        xor : function (other) {
            if (this.__bits.length != other.getBits().length) {
                throw new IllegalArgumentException("Sizes don't match");
            }

            var otherBits = other.getBitArray();
            for (var i = 0; i < this.__bits.length; i++) {
                this.__bits[i] ^= otherBits[i];
            }
        },

        toBytes : function (bitOffset, arr, offset, numBytes) {
            for (var i = 0; i < numBytes; i++) {
                var theByte = 0;
                for (var j = 0; j < 8; j++) {
                    if (this.get(bitOffset)) {
                        theByte |= 1 << (7 - j);
                    }
                    bitOffset++;
                }
                arr[offset + 1] = theByte;
            }
        },

        getBitArray : function () {
            return this.__bits;
        },

        // @todo implement
        reverse : function () {
            var newBits = new Uint32Array(this.__bits.length);
            var len = Math.floor((this.__size - 1) / 32);
            var oldBitsLen = len + 1;
            for (var i = 0; i < oldBitsLen; i++) {
                var x = this.__bits[i];
                x = ((x >> 1)  & 0x55555555) | ((x & 0x55555555) << 1);
                x = ((x >> 2)  & 0x33333333) | ((x & 0x33333333) << 2);
                x = ((x >> 4)  & 0x0f0f0f0f) | ((x & 0x0f0f0f0f) << 4);
                x = ((x >> 8)  & 0x00ff00ff) | ((x & 0x00ff00ff) << 8);
                x = ((x >> 16) & 0xffff)     | ((x & 0xffff)     << 16);
                newBits[len - i] = x;
            }

            if (this.__size != oldBitsLen * 32) {
                var leftOffset = oldBitsLen * 32 - this.__size;
                var mask = 1;
                for (var i = 0; i < 31 - leftOffset; i++) {
                    mask = (mask << 1) | 1;
                }
                var currentInt = (newBits[0] >> leftOffset) & mask;
                for (var i = 1; i < oldBitsLen; i++) {
                    var nextInt = newBits[i];
                    currentInt |= nextInt << (32 - leftOffset);
                    newBits[i - 1] = currentInt;
                    currentInt = (nextInt >> leftOffset) & mask;
                }
                newBits[oldBitsLen - 1] = currentInt;
            }

            this.__bits = newBits;
        },

        equals : function (o) {
            throw new Error('not implemented');
        },

        toString : function () {
            var result = '';
            for (var i = 0; i < this.__size; i++) {
                if ((i & 0x07) === 0) {
                    result += ' ';
                }
                result += this.get(i) ? 'X' : '.';
            }
            return result;
        },

        /**
         * @todo implement
         */
        clone : function () {
            throw new Error('not iplemented');
        }
    });

    return BitArray;
});