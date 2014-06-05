define([
    'dejavu/Class',
    'zxing/exception/ReaderException'
], function (Class, ReaderException) {
    'use strict';

    var FormatException = Class.declare({
        $name    : 'zxing/exception/FormatException',
        $extends : ReaderException
    });

    return FormatException;
});