define([
    'dejavu/Class',
    'zxing/exception/ReaderException'
], function (Class, ReaderException) {
    'use strict';

    var NotFoundException = Class.declare({
        $name    : 'zxing/exception/NotFoundException',
        $extends : ReaderException
    });

    return NotFoundException;
});