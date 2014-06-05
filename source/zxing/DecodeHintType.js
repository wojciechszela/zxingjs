define([
    'dejavu/AbstractClass'
], function (AbstractClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var DecodeHintType = AbstractClass.declare({
        $name : 'zxing/DecodeHintType',

        $constants : {
            OTHER : 'other',
            PURE_BARCODE : 'pure_barcode',
            POSSIBLE_FORMAT : 'possible_format',
            TRY_HARDER : 'try_harder',
            CHARACTER_SET : 'character_set',
            ALLOWED_LENGTHS : 'allowed_lengths',
            ASSUME_CODE_39_CHECK_DIGIT : 'assume_code_39_check_digit',
            ASSUME_GS1 : 'assume_gs1',
            RETURN_CODABAR_START_END : 'return_codabar_start_end',
            NEED_RESULT_POINT_CALLBACK : 'need_result_point_callback',
            ALLOWED_EAN_EXTENSIONS : 'allowed_ean_extensions'
        }
    });

    return DecodeHintType;
});