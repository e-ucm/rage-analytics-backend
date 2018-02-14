'use strict';

module.exports = (function() {
    var Collection = require('easy-collections');
    var _ = require('underscore');
    var db = require('./db');
    var versions = new Collection(db, 'versions');
    var games = require('./games');
    versions.sort = {
        _id: -1
    };

    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    var versionScheme = {
        id: '/Version',
        type: 'object',
        properties: {
            gameId: { type: 'ID'}
        },
        required: ['gameId'],
        additionalProperties: false
    };
    v.addSchema(versionScheme, '/Version');

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
        }

        return version;
    });

    versions.createVersion = function(object) {
        return games.findById(object.gameId).then(function (game) {
            if (!game) {
                throw {
                    message: 'Game does not exist',
                    status: 400
                };
            }
            var validationObj = v.validate(object, versionScheme);
            if (validationObj.errors && validationObj.errors.length > 0) {
                throw {
                    message: 'Version bad format: ' + validationObj.errors[0],
                    status: 400
                };
            }
            object.gameId = game._id;
            return versions.insert(object);
        });

    };

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
        require('./activities').remove({
            versionId: _id
        }).then(function () {
            next();
        }).fail(function() {
            next();
        });
    });

    return versions;
})();