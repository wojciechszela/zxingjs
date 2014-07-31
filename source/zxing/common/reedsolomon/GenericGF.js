define([
    'dejavu/FinalClass',
    'zxing/common/reedsolomon/GenericGFPoly',
    'zxing/exception/ArithmeticException',
    'zxing/exception/IllegalArgumentException'
], function (FinalClass, GenericGFPoly, ArithmeticException, IllegalArgumentException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var GenericGF = FinalClass.declare({
        $name: 'zxing/common/reedsolomon/GenericGF',

        $finals : {
            $statics : {
                AZTEC_DATA_12         : [0x1069, 4096, 1],
                AZTEC_DATA_10         : [0x409, 1024, 1],
                AZTEC_DATA_6          : [0x43, 64, 1],
                AZTEC_PARAM           : [0x13, 16, 1],
                QR_CODE_FIELD_256     : [0x011D, 256, 0],
                DATA_MATRIX_FIELD_256 : [0x012D, 256, 1],
                AZTEC_DATA_8          : [0x012D, 256, 1],
                MAXICODE_FIELD_64     : [0x43, 64, 1]
            },
        },

        __expTable      : null,
        __logTable      : null,
        __zero          : null,
        __one           : null,
        __size          : 0,
        __primitive     : 0,
        __generatorBase : 0,

        initialize : function (primitive, size, b) {
            if (1 == arguments.length) {
                primitive = arguments[0][0];
                size      = arguments[0][1];
                b         = arguments[0][2];
            };

            this.__primitive     = primitive;
            this.__size          = size;
            this.__generatorBase = b;

            this.__expTable = new Int32Array(size);
            this.__logTable = new Int32Array(size);
            var x = 1;
            for (var i = 0; i < this.__size; i++) {
                this.__expTable[i] = x;
                x *= 2;
                if (x >= size) {
                    x ^= this.__primitive;
                    x &= this.__size - 1;
                }
            }
            for (var i = 0; i < size - 1; i++) {
                this.__logTable[this.__expTable[i]] = i;
            }
            this.__zero = new GenericGFPoly(this, new Int32Array([0]));
            this.__one  = new GenericGFPoly(this, new Int32Array([1]));
        },

        getZero : function () {
            return this.__zero;
        },

        getOne : function () {
            return this.__one;
        },

        buildMonomial : function (degree, coefficient) {
            if (degree < 0) {
                throw new IllegalArgumentException();
            }
            if (coefficient == 0) {
                return this.__zero;
            }
            var coefficients = new Int32Array(degree + 1);
            coefficients[0] = coefficient;
            return new GenericGFPoly(this, coefficients);
        },

        exp : function (a) {
            return this.__expTable[a];
        },

        log : function (a) {
            if (a == 0) {
                throw new IllegalArgumentException();
            }

            return this.__logTable[a];
        },

        inverse : function (a) {
            if (a == 0) {
                throw new ArithmeticException();
            }
            return this.__expTable[this.__size - this.__logTable[a] - 1];
        },

        multiply : function (a, b) {
            if (a == 0 || b == 0) {
                return 0;
            }
            return this.__expTable[(this.__logTable[a] + this.__logTable[b]) % (this.__size - 1)];
        },

        getSize : function () {
            return this.__size;
        },

        getGeneratorBase : function () {
            return this.__generatorBase;
        },

        toString : function () {
            return 'GF(0x' + this.__primitive.toString(16) + ',' + this.__size + ')';
        }
    });

    return GenericGF;
});