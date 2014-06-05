define([
    'dejavu/Class',
    'zxing/Exception'
], function (Class, Exception) {
    'use strict';

    var ReaderException = Class.declare({
        $name    : 'zxing/exception/ReaderException',
        $extends : Exception
    });

    return ReaderException;
});