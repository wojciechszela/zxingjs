define([
    'dejavu/FinalClass',
    'zxing/lang/arrayCopy',
    'mout/lang/isObject',
    'mout/lang/isArray',
    'mout/object/mixIn'
], function (FinalClass, arrayCopy, isObject, isArray, mixIn) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var Result = FinalClass.declare({
        $name: 'zxing/Result',

        __text : null,

        __rawBytes : null,

        __resultPoints : null,

        __format : null,

        __resultMetadata : null,

        __timestamp : null,

        initialize : function (text, rawBytes, resultPoints, format, timestamp) {
            this.__text = text;
            this.__rawBytes = rawBytes;
            this.__resultPoints = resultPoints;
            this.__format = format;
            this.__resultMetadata = null;
            this.__timestamp = timestamp || Date.now();
        },

        getText : function () {
            return this.__text;
        },

        getRawBytes : function () {
            return this.__rawBytes;
        },

        getResultPoints : function () {
            return this.__resultPoints;
        },

        getBarcodeFormat : function () {
            return this.__format;
        },

        getResultMetadata : function () {
            return this.__resultMetadata;
        },

        putMetadata : function (type, value) {
            if (!isObject(this.__resultMetadata)) {
                this.__resultMetadata = {};
            }
            this.__resultMetadata[type] = value;
        },

        putAllMetadata : function (metadata) {
            if (!isObject(this.__resultMetadata)) {
                this.__resultMetadata = {};
            }
            this.__resultMetadata = mixIn(this.__resultMetadata, metadata);
        },

        addResultPoints : function (newPoints) {
            var oldPoints = this.__resultPoints;

            if (!isArray(oldPoints)) {
                this.__resultPoints = newPoints;
            } else if (isArray(newPoints) && newPoints.length > 0) {
                var allPoints = new Array(oldPoints.length + newPoints.length);
                allPoints = arrayCopy(oldPoints, 0, allPoints, 0, oldPoints.length);
                allPoints = arrayCopy(newPoints, 0, allPoints, oldPoints.length, newPoints.length);
                this.__resultPoints = allPoints;
            }
        },

        getTimestamp : function () {
            return this.__timestamp;
        },

        toString : function () {
            return this.__text();
        }
    });

    return Result;
});