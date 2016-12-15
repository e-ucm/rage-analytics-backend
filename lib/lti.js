'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var lti = new Collection(require('./db'), 'lti');

    lti.sort = {
        _id: -1
    };

    /**
     * Returns the lti object for ltiId
     */
    lti.getLtiObject = function (ltiId) {
        ltiId = lti.toObjectID(ltiId);
        return lti.find({_id: ltiId});
    };

    /**
     * Returns the lti object using a query
     */
    lti.getLtiByQuery = function(query) {
        return lti.find(query);
    };

    /**
     * Creates a new lti object with secret and class.
     * @Returns a promise with the lti object created
     */
    lti.createLtiObject = function (secret, idClass) {
        return lti.insert({
            secret: secret,
            idClass: idClass
        });

    };

    /**
     * Removes a lti object by ltiId.
     */
    lti.removeLtiObject = function (ltiId) {
        return lti.removeById(ltiId).then(function (result, err) {
            if (!err) {
                return {
                    message: 'Success.'
                };
            }
        });
    };

    return lti;
})();