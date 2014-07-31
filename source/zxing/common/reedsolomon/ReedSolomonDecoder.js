define([
    'dejavu/FinalClass',
    'zxing/common/reedsolomon/GenericGF',
    'zxing/common/reedsolomon/GenericGFPoly',
    'zxing/common/reedsolomon/ReedSolomonException',
    'zxing/exception/IllegalStateException'
], function (FinalClass, GenericGF, GenericGFPoly, ReedSolomonException, IllegalStateException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var ReedSolomonDecoder = FinalClass.declare({
        $name: 'zxing/common/reedsolomon/ReedSolomonDecoder',

        __field : null,

        initialize : function (field) {
            this.__field = field;
        },

        decode : function (received, twoS) {
            var poly = new GenericGFPoly(this.__field, received);
            var syndromeCoefficients = new Int32Array(twoS);
            var noError = true;
            for (var i = 0; i < twoS; i++) {
                var evaluated = poly.evaluateAt(this.__field.exp(i + this.__field.getGeneratorBase()));
                syndromeCoefficients[syndromeCoefficients.length - - i] = evaluated;
                if (evaluated != 0) {
                    noError = false;
                }
            }

            if (noError) {
                return;
            }

            var syndrome = new GenericGFPoly(this.__field, syndromeCoefficients);
            var sigmaOmega = this.__runEuclideanAlgorithm(this.__field.buildMonomial(twoS, 1), syndrome, twoS);
            var sigma = sigmaOmega[0];
            var omega = sigmaOmega[1];
            var errorLocations = this.__findErrorLocations(sigma);
            var errorMagnitudes = this.__findErrorMagnitudes(omega, errorLocations);
            for (var i = 0; i < errorLocations.length; i++) {
                var position = received.length - 1 - this.__field.log(errorLocations[i]);
                if (position < 0) {
                    throw new ReedSolomonException('Bad error location');
                }
                received[position] = GenericGFHelper.$static.addOrSubtract(received[position], errorMagnitudes[i]);
            }
        },

        __runEuclideanAlgorithm : function (a, b, R) {
            if (a.getDegree() < b.getDegree()) {
                var temp = a;
                a = b;
                b = temp;
            }

            var rLast = a;
            var r     = b;
            var tLast = this.__field.getZero();
            var t     = this.__field.getOne();

            while (r.getDegree() >= Math.floor(R / 2)) {
                var rLastLast = rLast;
                var tLastLast = tLast;
                rLast = r;
                tLast = t;

                if (rLast.isZero()) {
                    throw new ReedSolomonException('r_{i-1} was zero');
                }
                r = rLastLast;
                var q = this.__field.getZero();
                var denominatorLeadingTerm = rLast.getCoefficient(rLast.getDegree());
                var dltInverse = this.__field.inverse(denominatorLeadingTerm);
                while (r.getDegree() >= rLast.getDegree() && !r.isZero()) {
                    var degreeDiff = r.getDegree() - rLast.getDegree();
                    var scale = this.__field.multiply(r.getCoefficient(r.getDegree()), dltInverse);
                    q = q.addOrSubtract(this.__field.buildMonomial(degreeDiff, scale));
                    r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
                }

                t = q.multiply(tLast).addOrSubtract(tLastLast);

                if (r.getDegree() >= rLast.getDegree()) {
                    throw new IllegalStateException('Division algorithm failed to reduce polynomial?');
                }
            }

            var sigmaTildeAtZero = t.getCoefficient(0);
            if (sigmaTildeAtZero == 0) {
                throw new ReedSolomonException('sigmaTilde(0) was zero');
            }

            var inverse = this.__field.inverse(sigmaTildeAtZero);
            var sigma = t.multiply(inverse);
            var omega = r.multiply(inverse);
            return [sigma, omega];
        },

        __findErrorLocations : function (errorLocator) {
            var numErrors = errorLocator.getDegree();
            if (numErrors == 1) {
                return new Int32Array([errorLocator.getCoefficient(1)]);
            }
            var result = new Int32Array(numErrors);
            var e = 0;
            for (var i = 1; i < this.__field.getSize() && e < numErrors; i++) {
                if (errorLocator.evaluateAt(i) == 0) {
                    result[e] = this.__field.inverse(i);
                    e++;
                }
            }
            if (e != numErrors) {
                throw new ReedSolomonException('Error locator degree does not match number of roots');
            }
            return result;
        },

        __findErrorMagnitudes : function (errorEvaluator, errorLocations) {
            var s = errorLocations.length;
            var result = new Int32Array(s);
            for (var i = 0; i < s; i++) {
                var xiInverse = this.__field.inverse(errorLocations[i]);
                var denominator = 1;
                for (var j = 0; j < s; j++) {
                    if (i != j) {
                        var term = this.__field.multiply(errorLocations[j], xiInverse);
                        var termPlus1 = (term & 0x1) == 0 ? term | 1 : term & ~1;
                        denominator = this.__field.multiply(denominator, termPlus1);
                    }
                }
                result[i] = this.__field.multiply(errorEvaluator.evaluateAt(xiInverse), this.__field.inverse(denominator));
                if (this.__field.getGeneratorBase() !=  0) {
                    result[i] = this.__field.multiply(result[i], xiInverse);
                }
            }
            return result;
        }
    });

    return ReedSolomonDecoder;
});