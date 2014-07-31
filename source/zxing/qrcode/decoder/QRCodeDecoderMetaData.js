define([
    'dejavu/FinalClass',
    'mout/lang/isArray'
], function (FinalClass, isArray) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var QRCodeDecoderMetaData = FinalClass.declare({
        $name : 'zxing/qrcode/decoder/QRCodeDecoderMetaData',

        __mirrored : false,

        initialize : function (mirrored) {
            this.__mirrored = mirrored;
        },

        isMirrored : function () {
            return this.__mirrored;
        },

        applyMirroredCorrection : function (points) {
            if (!this.__mirrored || !isArray(points) || points.length < 3) {
                return;
            }
            var bottomLeft = points[0];
            points[0] = points[2];
            points[2] = bottomLeft;
        }
    });

    return QRCodeDecoderMetaData;
});