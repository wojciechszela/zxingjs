define([
    'dejavu/Class',
    'zxing/exception/ReaderException'
], function (Class, ReaderException) {
    'use strict';

    var ArithmeticException = Class.declare({
        $name    : 'zxing/exception/ArithmeticException',
        $extends : ReaderException
    });

    return ArithmeticException;
});