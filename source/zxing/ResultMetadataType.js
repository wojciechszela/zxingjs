define([
    'dejavu/AbstractClass'
], function (AbstractClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var ResultMetadataType = AbstractClass.declare({
        $name : 'zxing/ResultMetadataType',

        $constants : {
            OTHER : 'other',
            ORIENTATION : 'orientation',
            BYTE_SEGMENTS : 'byte_segments',
            ERROR_CORRECTION_LEVEL : 'error_correction_level',
            ISSUE_NUMBER : 'issue_number',
            SUGGESTED_PRICE : 'suggested_price',
            POSSIBLE_COUNTRY : 'possible_country',
            UPC_EAN_EXTENSION : 'upc_ean_extension',
            PDF417_EXTRA_METADATA : 'pdf417_extra_metadata',
            STRUCTURED_APPEND_SEQUENCE : 'structured_append_sequence',
            STRUCTURED_APPEND_PARITY : 'structured_append_parity'
        }
    });

    return ResultMetadataType;
});