define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var DecoderResult = FinalClass.declare({
        $name: 'zxing/common/DecoderResult',

        __rawBytes : null,
        __text : null,
        __byteSegments : null,
        __ecLevel : null,
        __structuredAppendParity : null,
        __structuredAppendSequenceNumber : null,

        __errorsCorrected : 0,
        __erasures : 0,
        __other : null,

        initialize : function (rawBytes, text, byteSegments, ecLevel, saSequence, saParity) {
            this.__rawBytes = rawBytes;
            this.__text = text;
            this.__byteSegments = byteSegments;
            this.__ecLevel = ecLevel;
            this.__structuredAppendParity = saParity || -1;
            this.__structuredAppendSequenceNumber = saSequence || -1;
        },

        getRawBytes : function () {
            return this.__rawBytes;
        },

        getText : function () {
            return this.__text;
        },

        getByteSegments : function () {
            return this.__byteSegments;
        },

        getECLevel : function () {
            return this.__ecLevel;
        },

        getErrorsCorrected : function () {
            return this.__errorsCorrected;
        },

        setErrorsCorrected : function (errorsCorrected) {
            this.__errorsCorrected = errorsCorrected;
        },

        getErasures : function () {
            return this.__erasures;
        },

        setErasure : function (erasures) {
            this.__erasures = erasures;
        },

        getOther : function () {
            return this.__other;
        },

        setOther : function (other) {
            this.__other = other;
        },

        hasStructuredAppend : function () {
            return this.__structuredAppendParity >= 0 && this.__structuredAppendSequenceNumber >= 0;
        },

        getStructuredAppendParity : function () {
            return this.__structuredAppendParity;
        },

        getStructuredAppendSequenceNumber : function () {
            return this.__structuredAppendSequenceNumber;
        }
    });

    return DecoderResult;
});