define([
    'dejavu/Class'
], function (Class) {
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

        toString : function () {
            return '(' + this.__x + ',' + this.__y + ')';
        }
    });

    return ResultPoint;
});