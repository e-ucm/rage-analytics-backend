'use strict';

module.exports = (function() {
    var Collection = require('easy-collections');
    var _ = require('underscore');
    var db = require('./db');
    var versions = new Collection(db, 'versions');
    versions.sort = {
        _id: -1
    };

    var token = function() {
        return Math.random().toString(36).substr(2);
    };

    versions.setValidator(function(version, insert) {
        if (insert) {
            if (!version.gameId) {
                return false;
            }
            return versions.find({
                gameId: version.gameId
            }).then(function(versions) {
                for (var i = 0; i < versions.length; i++) {
                    version = _.defaults(version, versions[i]);
                }
                delete version._id;
                return version;
            });
        } else {
            return version;
        }
    });

    versions.insert = function(object) {
        return Collection.prototype.insert.call(this, object).then(function(version) {
            var set = {
                trackingCode: version._id + token()
            };
            return versions.findAndModify(version._id, set);
        });
    };

    versions.preRemove(function(_id, next) {
        var versionId = _id.toString();
        db.collection('gameplays_' + versionId).drop();
        next();
    });

    return versions;
})();