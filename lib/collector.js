'use strict';

module.exports = (function () {
    var authTokens = require('./auth-tokens');
    var players = require('./players');
    var dataSource = require('./traces');
    var versions = require('./versions');

    return {
        start: function (trackingCode, authorization) {
            return versions.find({
                trackingCode: trackingCode
            }, true).then(function (version) {
                if (version) {
                    return players.findByAuthorization(authorization)
                        .then(function (player) {
                            if (player) {
                                return authTokens.start(player._id, trackingCode, version)
                                    .then(function (authToken) {
                                        // Track data for user
                                        return {
                                            authToken: authToken,
                                            playerName: player.name
                                        };
                                    });
                            } else {
                                throw {
                                    status: 401
                                };
                            }
                        });
                } else {
                    throw {
                        status: 404
                    };
                }
            });
        },
        track: function (authToken, data) {
            return authTokens.track(authToken).then(function (authToken) {
                return dataSource.add(authToken.playerId, authToken.versionId, authToken.gameplayId, data);
            });
        }
    };
})();