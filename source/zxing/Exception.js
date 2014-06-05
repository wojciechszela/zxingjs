define([
    'dejavu/Class'
], function (Class) {
    'use strict';

    var Exception = Class.declare({
        $name    : 'zxing/Exception',
        $extends : Error
    });

    return Exception;
});