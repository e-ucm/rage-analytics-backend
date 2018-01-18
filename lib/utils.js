'use strict';

module.exports = (function () {

    var hasKey = function (object, key) {
        var o = object;
        var matches = 0;
        var keys = key.split('.');
        keys.forEach(function (k) {
            if (o[k]) {
                o = o[k];
                matches += 1;
            }
        });

        if (matches === keys.length) {
            return true;
        }
        return false;
    };

    function fetchFromObject(obj, prop) {

        if (typeof obj === 'undefined') {
            return false;
        }

        var _index = prop.indexOf('.');
        if (_index > -1) {
            return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
        }

        return obj[prop];
    }

    var addToArrayHandler = function (update, object, stringKey, add) {
        var value = fetchFromObject(object, stringKey);
        if (hasKey(object, stringKey)) {
            if (add) {
                if (!update.$addToSet) {
                    update.$addToSet = {};
                }
                if (Array.isArray(value)) {
                    update.$addToSet[stringKey] = {
                        $each: value
                    };
                } else if (typeof value === 'string') {
                    update.$addToSet[stringKey] = value;
                }
            } else {
                if (!update.$pull) {
                    update.$pull = {};
                }
                if (Array.isArray(value)) {
                    update.$pull[stringKey] = {
                        $in: value
                    };
                } else if (typeof value === 'string') {
                    update.$pull[stringKey] = value;
                }
            }
        }
    };
    return {
        addToArrayHandler: addToArrayHandler
    };
})();