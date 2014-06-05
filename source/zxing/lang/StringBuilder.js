define([
    'dejavu/Class',
    'zxing/exception/StringIndexOutOfBoundsException'
], function (Class, StringIndexOutOfBoundsException) {
    'use strict';

    /**
     * @todo finish implementation
     */
    var StringBuilder = Class.declare({
        $name : 'zxing/lang/StringBuilder',

        __string : null,

        initialize : function () {
            this.__string = '';
        },

        append : function (str) {
            this.__string += str;
        },

        insert : function (index, str) {
            if (index < 0 || index > this.__string.length) {
                throw new StringIndexOutOfBoundsException ();
            }

            this.__string = this.__string.substring(0, index) + str + this.__string.substring(index);
        },

        del : function (start, end) {
            this.__string = this.__string.substring(start, end);
        },

        length : function () {
            return this.__string.length;
        },

        toString : function () {
            return this.__string;
        },

        charAt : function (i) {
            if (i >= this.__string.length) {
                throw new StringIndexOutOfBoundsException ();
            }

            return this.__string.charAt(i);
        },

        charCodeAt : function (i) {
            if (i >= this.__string.length) {
                throw new StringIndexOutOfBoundsException ();
            }

            return this.__string.charCodeAt(i);
        },

        setCharAt : function (i, val) {
            if (i >= this.__string.length) {
                throw new StringIndexOutOfBoundsException ();
            }

            this.__string = this.__string.substr(0, i) + val + this.__string.substr(i + val.length);
        },

        deleteCharAt : function (i) {
            this.__string = this.__string.substr(0, i) + this.__string.substr(i + 1);
        },

        setLength : function (length) {
            if (this.__string.length > length) {
                this.__string = this.__string.substring(0, length + 1);
            }
        }
    });

    return StringBuilder;
});