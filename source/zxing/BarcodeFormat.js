define([
    'dejavu/AbstractClass'
], function (AbstractClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var BarcodeFormat = AbstractClass.declare({
        $name : 'zxing/BarcodeFormat',

        $constants : {
            AZTEC : 'aztec',
            CODABAR : 'codabar',
            CODE_39 : 'code_39',
            CODE_93 : 'code_93',
            CODE_128 : 'code_128',
            DATA_MATRIX : 'data_matrix',
            EAN_8 : 'ean_8',
            EAN_13 : 'ean_13',
            ITF : 'itf',
            MAXICODE : 'maxicode',
            PDF_417 : 'pdf_417',
            QR_CODE : 'qr_code',
            RSS_14 : 'rss_14',
            RSS_EXPANDED : 'rss_expanded',
            UPC_A : 'upc_a',
            UPC_E : 'upc_e',
            UPC_EAN_EXTENSION : 'upc_ean_extension'
        }
    });

    return BarcodeFormat;
});