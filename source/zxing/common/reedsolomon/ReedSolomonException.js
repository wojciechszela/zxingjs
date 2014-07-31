define([
    'dejavu/Class',
    'zxing/exception/ReaderException'
], function (Class, ReaderException) {
    'use strict';

    var ReedSolomonException = Class.declare({
        $name    : 'zxing/common/reedsolomon/ReedSolomonException',
        $extends : ReaderException
    });

    return ReedSolomonException;
});