'use strict';

module.exports = (function () {

    var addToArrayHandler = function (update, object, stringKey, add) {
        if (object[stringKey]) {
            if (add) {
                if (!update.$addToSet) {
                    update.$addToSet = {};
                }
                if (Array.isArray(object[stringKey])) {
                    update.$addToSet[stringKey] = {
                        $each: object[stringKey]
                    };
                } else if (typeof object[stringKey] === 'string') {
                    update.$addToSet[stringKey] = object[stringKey];
                }
            } else {
                if (!update.$pull) {
                    update.$pull = {};
                }
                if (Array.isArray(object[stringKey])) {
                    update.$pull[stringKey] = {
                        $in: object[stringKey]
                    };
                } else if (typeof object[stringKey] === 'string') {
                    update.$pull[stringKey] = object[stringKey];
                }
            }
            delete object[stringKey];
        }
    };
    return {
        addToArrayHandler: addToArrayHandler
    };
})();