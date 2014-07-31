define([
    'dejavu/FinalClass',
    'zxing/common/reedsolomon/GenericGFHelper',
    'zxing/exception/IllegalArgumentException',
    'zxing/lang/arrayCopy'
], function (FinalClass, GenericGFHelper, IllegalArgumentException, arrayCopy) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var GenericGFPoly = FinalClass.declare({
        $name: 'zxing/common/reedsolomon/GenericGFPoly',

        __field : null,
        __coefficients : null,

        initialize : function (field, coefficients) {
            if (coefficients.length == 0) {
                throw new IllegalArgumentException();
            }

            this.__field = field;
            var coefficientsLength = coefficients.length;
            if (coefficients.length > 1 && coefficients[0] == 0) {
                var firstNonZero = 1;
                while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0) {
                    firstNonZero++;
                }
                if (firstNonZero == coefficientsLength) {
                    this.__coefficients = new Int32Array([0]);
                } else {
                    this.__coefficients = new Int32Array([coefficientsLength - firstNonZero]);
                    arrayCopy(coefficients, firstNonZero, this.__coefficients, 0, this.__coefficients.length);
                }
            } else {
                this.__coefficients = coefficients;
            }
        },

        getField : function () {
            return this.__field;
        },

        getCoefficients : function () {
            return this.__coefficients;
        },

        getDegree : function () {
            return this.__coefficients.length - 1;
        },

        isZero : function () {
            return this.__coefficients[0] == 0;
        },

        getCoefficient : function (degree) {
            return this.__coefficients[this.__coefficients.length - 1 - degree];
        },

        evaluateAt : function (a) {
            if (a == 0) {
                return this.getCoefficient(0);
            }
            var size = this.__coefficients.length;
            if (a == 1) {
                var result = 0;
                for (var _i = 0; _i < size; _i++) {
                    var coefficient = this.__coefficients[_i];
                    result = GenericGFHelper.$static.addOrSubtract(result, coefficient);
                }
                return result;
            }
            var result = this.__coefficients[0];
            for (var i = 1; i < size; i++) {
                result = GenericGFHelper.$static.addOrSubtract(this.__field.multiply(a, result), this.__coefficients[i]);
            }
            return result;
        },

        addOrSubtract : function (other) {
            if (this.__field != other.getField()) {
                throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
            }
            if (this.isZero()) {
                return other;
            }
            if (other.isZero()) {
                return this;
            }

            var smallerCoefficients = this.__coefficients;
            var largerCoefficients = other.getCoefficients();
            if (smallerCoefficients.length > largerCoefficients.length) {
                var temp = smallerCoefficients;
                smallerCoefficients = largerCoefficients;
                largerCoefficients = temp;
            }

            var sumDiff = new Int32Array(largerCoefficients.length);
            var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
            arrayCopy(largerCoefficients, 0, sumDiff, 0, lengthDiff);

            for (var i = lengthDiff; i < largerCoefficients.length; i++) {
                sumDiff[i] = GenericGFHelper.$static.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
            }

            return new GenericGFPoly(this.__field, sumDiff);
        },

        multiply : function (other) {
            if (other instanceof GenericGFPoly) {
                return this.__multiplyPoly(other);
            } else {
                return this.__multiplyScalar(other);
            }
        },

        __multiplyPoly : function (other) {
            if (this.__field != other.getField()) {
                throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
            }
            if (this.isZero() || other.isZero()) {
                return this.__field.getZero();
            }

            var aCoefficients = this.__coefficients;
            var aLength       = aCoefficients.length;
            var bCoefficients = other.getCoefficients();
            var bLength       = bCoefficients.length;
            var product       = new Int32Array(aLength + bLength - 1);
            for (var i = 0; i < aLength; i++) {
                var aCoeff = aCoefficients[i];
                for (var j = 0; j < bLength; j++) {
                    product[i + j] = GenericGFHelper.$static.addOrSubtract(product[i + j]), this.__field.multiply(aCoeff, bCoefficients[j]);
                }
            }

            return new GenericGFPoly(this.__field, product);
        },

        __multiplyScalar : function (scalar) {
            if (scalar == 0) {
                return this.__field.getZero();
            }

            if (scalar == 1) {
                return this;
            }
            var size = this.__coefficients.length;
            var product = new Int32Array(size);
            for (var i = 0; i < size; i++) {
                product[i] = this.__field.multiply(this.__coefficients[i], scalar);
            }

            return new GenericGFPoly(this.__field, product);
        },

        multiplyByMonomial : function (degree, coefficient) {
            if (degree < 0) {
                throw new IllegalArgumentException();
            }
            if (coefficient == 0) {
                return this.__field.getZero();
            }
            var size = this.__coefficients.length;
            var product = new Int32Array(size + degree);
            for (var i = 0; i < size; i++) {
                product[i] = this.__field.multiply(this.__coefficients[i], coefficient);
            }
            return new GenericGFPoly(this.__field, product);
        },

        divide : function (other) {
            if (this.__field != other.getField()) {
                throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
            }
            if (other.isZero()) {
                throw new IllegalArgumentException('Divide by 0');
            }

            var quotient = this.__field.getZero();
            var remainder = this;

            var denominatorLeadingTerm = other.getCoefficient(other.getDegree());
            var inverseDenominatorLeadingTerm = this.__field.inverse(denominatorLeadingTerm);

            while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
                var degreeDifference = remainder.getDegree() - other.getDegree();
                var scale = this.__field.multiply(remainder.getCoefficient(remainder.getDegree()), inverseDenominatorLeadingTerm);
                var term = other.multiplyByMonomial(degreeDifference, scale);
                var iterationQuotient = this.__field.buildMonomial(degreeDifference, scale);
                quotient = quotient.addOrSubtract(iterationQuotient);
                remainder = remainder.addOrSubtract(term);
            }

            return [quotient, remainder];
        },

        toString : function () {
            var result = '';
            for (var degree = this.getDegree(); degree >= 0; degree--) {
                var coefficient = this.getCoefficient(degree);
                if (coefficient != 0) {
                    if (coefficient < 0) {
                        result += ' - ';
                        coefficient = -coefficient;
                    } else {
                        if (result.length > 0) {
                            result += ' + ';
                        }
                    }
                    if (degree == 0 || coefficient != 1) {
                        var alphaPower = this.__field.log(coefficient);
                        if (alphaPower == 0) {
                            result += '1';
                        } else if (alphaPower == 1) {
                            result += 'a';
                        } else {
                            result += 'a^' + alphaPower;
                        }
                    }
                    if (degree != 0) {
                        if (degree == 1) {
                            result += 'x';
                        } else {
                            result += 'x^' + degree;
                        }
                    }
                }
            }
            return result;
        }
    });

    return GenericGFPoly;
});