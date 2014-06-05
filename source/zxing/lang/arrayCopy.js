define([], function () {
    'use strict';

    return function (src, srcPos, dest, destPos, length) {
        for (var i = 0; i < length; i++) {
            dest[destPos + i] = src[srcPos + i];
        }

        return dest;
    };
});

/*
faster

function memcpy(dst, dstOffset, src, srcOffset, length) {
var dstU8 = new Uint8Array(dst, dstOffset, length);
var srcU8 = new Uint8Array(src, srcOffset, length);
dstU8.set(srcU8);
};

*/