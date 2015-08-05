'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var authTokens = new Collection(require('./db'), 'authtokens');

    var token = function () {
        return Math.random().toString(10).substr(10);
    };

    authTokens.newGameplay = function (playerId, versionId, gameplayId) {
        return authTokens.find({
            playerId: playerId,
            gameplayId: gameplayId,
            versionId: versionId
        }, true).then(function (authToken) {
            if (authToken) {
                var gameplays = new Collection(require('./db'), 'gameplays_' + versionId);
                return gameplays.insert({
                    playerId: playerId,
                    sessions: 0,
                    started: new Date()
                }).then(function (gameplay) {
                    return authTokens.findAndModify(authToken._id, {
                        gameplayId: gameplay._id
                    }).then(function () {
                        return gameplay._id;
                    });
                });
            } else {
                return gameplayId;
            }
        });
    };


    authTokens.start = function (playerId, trackingCode, version) {
        var gameplays = new Collection(require('./db'), 'gameplays_' + version._id);
        return gameplays.find({
            playerId: playerId
        }, true)
            .then(function (gameplay) {
                if (gameplay) {
                    return gameplays.findAndModify(gameplay._id, {
                        sessions: gameplay.sessions + 1
                    });
                } else {
                    return gameplays.insert({
                        playerId: playerId,
                        sessions: 1,
                        started: new Date()
                    });
                }
            }).then(function (gameplay) {
                // To assure uniqueness in the authtoken, but also randomness
                var authToken = version._id + gameplay._id + token() + gameplay.sessions;
                return authTokens.insert({
                    authToken: authToken,
                    gameplayId: gameplay._id,
                    versionId: version._id,
                    playerId: playerId,
                    lastAccessed: new Date()
                }).then(function () {
                    return authToken;
                });
            });
    };

    authTokens.track = function (authToken) {
        return authTokens.find({
            authToken: authToken
        }, true).then(function (authToken) {
            if (authToken) {
                var set = {
                    lastAccessed: new Date()
                };
                return authTokens.findAndModify(authToken._id, set);
            } else {
                throw {
                    status: 401
                };
            }
        });
    };

    return authTokens;
})();