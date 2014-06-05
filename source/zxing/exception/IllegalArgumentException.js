define([
    'dejavu/Class',
    'zxing/Exception'
], function (Class, Exception) {
    'use strict';

    var IllegalArgumentException = Class.declare({
        $name    : 'zxing/exception/IllegalArgumentException',
        $extends : Exception
    });

    return IllegalArgumentException;
});