define([
    'dejavu/Class',
    'zxing/Exception'
], function (Class, Exception) {
    'use strict';

    var UnsupportedOperationException = Class.declare({
        $name    : 'zxing/exception/UnsupportedOperationException',
        $extends : Exception
    });

    return UnsupportedOperationException;
});