define([
    'dejavu/Class',
    'zxing/Exception'
], function (Class, Exception) {
    'use strict';

    var IllegalStateException = Class.declare({
        $name    : 'zxing/exception/IllegalStateException',
        $extends : Exception
    });

    return IllegalStateException;
});