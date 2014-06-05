define([
    'dejavu/FinalClass'
], function (FinalClass) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var EANManufacturerOrgSupport = FinalClass.declare({
        $name : 'zxing/oned/EANManufacturerOrgSupport',

        __ranges : null,

        __countryIdentifiers : null,

        lookupCountryIdentifier : function (productCode) {
            this.__initIfNeeded();
            var prefix = parseInt(productCode.substring(0, 3));
            var max    = this.__ranges.length;

            for (var i = 0; i < max; i++) {
                var range = this.__ranges[i];
                var start = range[0];
                if (prefix < start) {
                    return null;
                }

                var end = range.length === 1 ? start : range[1];

                if (prefix <= end) {
                    return this.__countryIdentifiers[i];
                }
            }

            return null;
        },

        __add : function (range, id) {
            this.__ranges.push(range);
            this.__countryIdentifiers.push(id);
        },

        __initIfNeeded : function () {
            if (null === this.__ranges && null === this.__countryIdentifiers) {
                this.__ranges = new Array();
                this.__countryIdentifiers = new Array();

                this.__add(new Uint32Array([0, 19]),    'US/CA');
                this.__add(new Uint32Array([30, 39]),   'US');
                this.__add(new Uint32Array([60, 139]),  'US/CA');
                this.__add(new Uint32Array([300, 379]), 'FR');
                this.__add(new Uint32Array([380]),      'BG');
                this.__add(new Uint32Array([383]),      'SI');
                this.__add(new Uint32Array([385]),      'HR');
                this.__add(new Uint32Array([387]),      'BA');
                this.__add(new Uint32Array([400, 440]), 'DE');
                this.__add(new Uint32Array([450, 459]), 'JP');
                this.__add(new Uint32Array([460, 469]), 'RU');
                this.__add(new Uint32Array([471]),      'TW');
                this.__add(new Uint32Array([474]),      'EE');
                this.__add(new Uint32Array([475]),      'LV');
                this.__add(new Uint32Array([476]),      'AZ');
                this.__add(new Uint32Array([477]),      'LT');
                this.__add(new Uint32Array([478]),      'UZ');
                this.__add(new Uint32Array([479]),      'LK');
                this.__add(new Uint32Array([480]),      'PH');
                this.__add(new Uint32Array([481]),      'BY');
                this.__add(new Uint32Array([482]),      'UA');
                this.__add(new Uint32Array([484]),      'MD');
                this.__add(new Uint32Array([485]),      'AM');
                this.__add(new Uint32Array([486]),      'GE');
                this.__add(new Uint32Array([487]),      'KZ');
                this.__add(new Uint32Array([489]),      'HK');
                this.__add(new Uint32Array([490, 499]), 'JP');
                this.__add(new Uint32Array([500, 509]), 'GB');
                this.__add(new Uint32Array([520]),      'GR');
                this.__add(new Uint32Array([528]),      'LB');
                this.__add(new Uint32Array([529]),      'CY');
                this.__add(new Uint32Array([531]),      'MK');
                this.__add(new Uint32Array([535]),      'MT');
                this.__add(new Uint32Array([539]),      'IE');
                this.__add(new Uint32Array([540, 549]), 'BE/LU');
                this.__add(new Uint32Array([560]),      'PT');
                this.__add(new Uint32Array([569]),      'IS');
                this.__add(new Uint32Array([570, 579]), 'DK');
                this.__add(new Uint32Array([590]),      'PL');
                this.__add(new Uint32Array([594]),      'RO');
                this.__add(new Uint32Array([599]),      'HU');
                this.__add(new Uint32Array([600, 601]), 'ZA');
                this.__add(new Uint32Array([603]),      'GH');
                this.__add(new Uint32Array([608]),      'BH');
                this.__add(new Uint32Array([609]),      'MU');
                this.__add(new Uint32Array([611]),      'MA');
                this.__add(new Uint32Array([613]),      'DZ');
                this.__add(new Uint32Array([616]),      'KE');
                this.__add(new Uint32Array([618]),      'CI');
                this.__add(new Uint32Array([619]),      'TN');
                this.__add(new Uint32Array([621]),      'SY');
                this.__add(new Uint32Array([622]),      'EG');
                this.__add(new Uint32Array([624]),      'LY');
                this.__add(new Uint32Array([625]),      'JO');
                this.__add(new Uint32Array([626]),      'IR');
                this.__add(new Uint32Array([627]),      'KW');
                this.__add(new Uint32Array([628]),      'SA');
                this.__add(new Uint32Array([629]),      'AE');
                this.__add(new Uint32Array([640, 649]), 'FI');
                this.__add(new Uint32Array([690, 695]), 'CN');
                this.__add(new Uint32Array([700, 709]), 'NO');
                this.__add(new Uint32Array([729]),      'IL');
                this.__add(new Uint32Array([730, 739]), 'SE');
                this.__add(new Uint32Array([740]),      'GT');
                this.__add(new Uint32Array([741]),      'SV');
                this.__add(new Uint32Array([742]),      'HN');
                this.__add(new Uint32Array([743]),      'NI');
                this.__add(new Uint32Array([744]),      'CR');
                this.__add(new Uint32Array([745]),      'PA');
                this.__add(new Uint32Array([746]),      'DO');
                this.__add(new Uint32Array([750]),      'MX');
                this.__add(new Uint32Array([754, 755]), 'CA');
                this.__add(new Uint32Array([759]),      'VE');
                this.__add(new Uint32Array([760, 769]), 'CH');
                this.__add(new Uint32Array([770]),      'CO');
                this.__add(new Uint32Array([773]),      'UY');
                this.__add(new Uint32Array([775]),      'PE');
                this.__add(new Uint32Array([777]),      'BO');
                this.__add(new Uint32Array([779]),      'AR');
                this.__add(new Uint32Array([780]),      'CL');
                this.__add(new Uint32Array([784]),      'PY');
                this.__add(new Uint32Array([785]),      'PE');
                this.__add(new Uint32Array([786]),      'EC');
                this.__add(new Uint32Array([789, 790]), 'BR');
                this.__add(new Uint32Array([800, 839]), 'IT');
                this.__add(new Uint32Array([840, 849]), 'ES');
                this.__add(new Uint32Array([850]),      'CU');
                this.__add(new Uint32Array([858]),      'SK');
                this.__add(new Uint32Array([859]),      'CZ');
                this.__add(new Uint32Array([860]),      'YU');
                this.__add(new Uint32Array([865]),      'MN');
                this.__add(new Uint32Array([867]),      'KP');
                this.__add(new Uint32Array([868, 869]), 'TR');
                this.__add(new Uint32Array([870, 879]), 'NL');
                this.__add(new Uint32Array([880]),      'KR');
                this.__add(new Uint32Array([885]),      'TH');
                this.__add(new Uint32Array([888]),      'SG');
                this.__add(new Uint32Array([890]),      'IN');
                this.__add(new Uint32Array([893]),      'VN');
                this.__add(new Uint32Array([896]),      'PK');
                this.__add(new Uint32Array([899]),      'ID');
                this.__add(new Uint32Array([900, 919]), 'AT');
                this.__add(new Uint32Array([930, 939]), 'AU');
                this.__add(new Uint32Array([940, 949]), 'AZ');
                this.__add(new Uint32Array([955]),      'MY');
                this.__add(new Uint32Array([958]),      'MO');
            }
        }
    });

    return EANManufacturerOrgSupport;
});