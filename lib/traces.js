'use strict';

module.exports = (function () {
    var Q = require('q');
    var authTokens = require('./auth-tokens');
    // Consumers interested in the incoming traces
    var consumers = [];

    /**
     * If a verb with the following 'id' attribute is received
     * a new gameplay will be created.
     */
    var startedGameplayId = 'http://gleanerlrs.com/verbs/startedgameplay';

    /**
     * Used as a key in the 'extensions' attribute of an object
     * in a statement, to store they ID of a given gameplay.
     */
    var gameplayIdKey = 'http://gleanerlrs.com/extensions/gameplayid';


    /**
     * Adds to a given statement an attribute pointing to the gameplay id that statement belongs to.
     * The attribute will be added as an extension inside the object definition attribute.
     * If there isn't one, this method will create a new one, resulting in following statement:
     *
     * {
     *      ...
     *      'object': {
     *          ...
     *          'definition': {
     *              ...
     *              'extensions': {
     *                  'http://gleanerlrs.com/extensions/startedgameplay': <gameplayId>
     *              }
     *          }
     *      }
     * }
     *
     * @param statement
     * @param gameplayId
     */
    var addGameplayIdToStatement = function (statement, gameplayId) {
        if (!statement.object) {
            statement.object = {
                definition: {
                    extensions: {}
                }
            };
        } else if (!statement.object.definition) {
            statement.object.definition = {
                extensions: {}
            };
        } else if (!statement.object.definition.extensions) {
            statement.object.definition.extensions = {};
        }
        statement.object.definition.extensions[gameplayIdKey] = gameplayId;
    };

    var processTraces = function (playerId, versionId, gameplayId, data, start) {
        if (!data || !data.length) {
            return Q.fcall(function () {
                throw {
                    status: 400
                };
            });
        }

        var i = start;
        var stop = false;
        while (i < data.length && !stop) {
            if (data[i].verb && data[i].verb.id === startedGameplayId) {
                stop = true;
            } else {
                addGameplayIdToStatement(data[i], gameplayId);
                i++;
            }
        }

        if (i === data.length) {
            return Q.fcall(function () {
                return data;
            });
        } else {
            return authTokens.newGameplay(playerId, versionId, gameplayId)
                .then(function (gameplayId) {
                    addGameplayIdToStatement(data[i], gameplayId);
                    return processTraces(playerId, versionId, gameplayId, data, i + 1);
                });
        }
    };

    return {
        addConsumer: function (consumer) {
            consumers.push(consumer);
        },
        add: function (playerId, versionId, gameplayId, data) {

            return processTraces(playerId, versionId, gameplayId, data, 0).then(function (data) {
                var promises = [];
                for (var i = 0; i < consumers.length; i++) {
                    promises.push(consumers[i].addTraces(playerId, versionId, gameplayId, data));
                }
                return Q.all(promises)
                    .then(function () {
                        return true;
                    }).fail(function (err) {
                        return err;
                    });
            });
        }
    };
})();