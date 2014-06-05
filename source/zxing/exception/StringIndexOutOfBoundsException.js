define([
    'dejavu/Class',
    'zxing/Exception'
], function (Class, Exception) {
    'use strict';

    var StringIndexOutOfBoundsException = Class.declare({
        $name    : 'zxing/exception/StringIndexOutOfBoundsException',
        $extends : Exception
    });

    return StringIndexOutOfBoundsException;
});