define([
    'dejavu/Class',
    'zxing/exception/ReaderException'
], function (Class, ReaderException) {
    'use strict';

    var ChecksumException = Class.declare({
        $name    : 'zxing/exception/ChecksumException',
        $extends : ReaderException
    });

    return ChecksumException;
});