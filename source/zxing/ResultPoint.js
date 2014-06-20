define([
    'dejavu/Class',
    'zxing/common/detector/MathUtils'
], function (Class, MathUtils) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var ResultPoint = Class.declare({
        $name: 'zxing/ResultPoint',

        __x : null,
        __y : null,

        initialize : function (x, y) {
            this.__x = x;
            this.__y = y;
        },

        getX : function () {
            return this.__x;
        },

        getY : function () {
            return this.__y;
        },

        equals : function (other) {
            if (other instanceof ResultPoint) {
                return this.__x == other.getX() && this.__x == other.getY();
            }

            return false;
        },

        toString : function () {
            return '(' + this.__x + ',' + this.__y + ')';
        },

        $statics : {
            orderBestPatterns : function (patterns) {
                var zeroOneDistance = this.$static.distance(patterns[0], patterns[1]);
                var oneTwoDistance  = this.$static.distance(patterns[1], patterns[2]);
                var zeroTwoDistance = this.$static.distance(patterns[0], patterns[2]);

                var pointA;
                var pointB;
                var pointC;

                if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
                    pointB = patterns[0];
                    pointA = patterns[1];
                    pointC = patterns[2];
                } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
                    pointB = patterns[1];
                    pointA = patterns[0];
                    pointC = patterns[2];
                } else {
                    pointB = patterns[2];
                    pointA = patterns[0];
                    pointC = patterns[1];
                }

                if (this.$static.crossProductZ(pointA, pointB, pointC) < 0.0) {
                    var temp = pointA;
                    pointA = pointC;
                    pointC = temp;
                }

                patterns[0] = pointA;
                patterns[1] = pointB;
                patterns[2] = pointC;
            },

            distance : function (pattern1, pattern2) {
                return MathUtils.$static.distance(pattern1.getX(), pattern1.getY(), pattern2.getX(), pattern2.getY());
            },

            crossProductZ : function (pointA, pointB, pointC) {
                var bX = pointB.getX();
                var bY = pointB.getY();

                return ((pointC.getX() - bX) * (pointA.getY() - bY)) - ((pointC.getY() - bY)) * ((pointA.getX() - bX));
            }
        }
    });

    return ResultPoint;
});