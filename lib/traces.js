'use strict';

/**
 * Manages the 'consumers' of the data received.
 *
 * There are two main data consumers.
 *      1) OpenLRS consumer which stores the data in an LRS.
 *      2) Kafka consumer which queues the data to be analyzed by a Storm cluster.
 */

module.exports = (function () {
    var Q = require('q');
    var tracesConverter = require('./tracesConverter');
    // Consumers interested in the incoming traces
    var consumers = [];

    /**
     * Used as a key in the 'extensions' attribute of an object
     * in a statement, to store they ID of a given gameplay.
     */
    var gameplayIdKey = 'gameplayId';

    /**
     * Used as a key in the 'extensions' attribute of an object
     * in a statement, to store they ID of a given game version.
     */
    var versionIdKey = 'versionId';

    /**
     * Used as a key in the 'extensions' attribute of an object
     * in a statement, to store the attempts of a player playing a game.
     */
    var sessionKey = 'session';

    var entries = {};

    var buildEntries = function (gameplayId, versionId, session) {
        entries[gameplayIdKey] = gameplayId;
        entries[versionIdKey] = versionId;
        entries[sessionKey] = session;
        return entries;
    };

    /**
     * Adds to a given statement different attributes defined by the entries.
     * For instance, an attribute could be pointing to the gameplay id that statement belongs to.
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
     *                  'gameplayId': <gameplayId>,
     *                  'versionId': <versionId>
     *              }
     *          }
     *      }
     * }
     *
     *
     * @param statement
     * @param entries an object with the entries (<key, value>) you want to add.
     */
    var addEntriesToStatement = function (statement, entries) {
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
        for (var property in entries) {
            if (entries.hasOwnProperty(property)) {
                statement.object.definition.extensions[property] = entries[property];
            }
        }
    };

    var wrongFormatError = function (statement, err) {
        var message = 'Statement ' + statement + ' doesn\'t have a valid format. ';
        if (err) {
            message += err;
        }
        throw {
            status: 400,
            message: message
        };
    };

    /**
     * Adds a reference with the gameplayId and also versionId to the data.
     * The gameplay and version id reference is added as an extension, more info. at 'addGameplayIdToStatement' function.
     *
     * @param playerId
     * @param versionId
     * @param gameplayId
     * @param data - An array of statements.
     * @param start
     * @returns {*}
     */
    var processTraces = function (playerId, versionId, gameplayId, session, data, start) {
        if (!data || !data.length) {
            return Q.fcall(function () {
                throw {
                    status: 400,
                    message: 'Statements must be an array!'
                };
            });
        }

        var convertedData = [];
        var i = start;
        while (i < data.length) {
            var statement = data[i];
            addEntriesToStatement(statement, buildEntries(gameplayId, versionId, session));

            var result = tracesConverter(statement);
            if (result.error || !result.trace) {
                return Q.fcall(wrongFormatError(statement, result.error));
            }

            convertedData.push(result.trace);
            i++;
        }

        return Q.fcall(function () {
            return convertedData;
        });
    };

    return {
        /**
         * Registers a new consumer for the received data.
         *
         * @param consumer - A consumer is an object with an 'addTraces' method as described below:
         *
         *
         *      @param playerId - String, the ID of the player created in the authentication process. More info. at
         *                        'collector.js'
         *      @param versionId - String, the ID of the version of the game this data belongs to.
         *      @param gameplayId - String, the ID of the gameplay created for the anonymous player. When starting to
         *                          collect data a new gameplay is created if there isn't an existing one already for
         *                          the anonymous player.
         *      @param data - Array[Statements], where a Statement must be xAPI v1.0.1 compliant
         *                    (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#statement).
         *
         *      function addTraces(playerId, versionId, gameplayId, data) {
         *          ...
         *      }
         */
        addConsumer: function (consumer) {
            consumers.push(consumer);
        },

        clearConsumers: function () {
            consumers = [];
        },

        /**
         * Processes the data (see 'processTraces' function) and passes the processed data to the available consumers.
         *
         * @param playerId
         * @param versionId
         * @param gameplayId
         * @param data
         * @returns { message: 'Success.'} or an array of errors from the consumers that failed while consuming the data.
         */
        add: function (playerId, versionId, gameplayId, session, data) {

            return processTraces(playerId, versionId, gameplayId, session, data, 0).then(function (convertedData) {
                var promises = [];
                for (var i = 0; i < consumers.length; i++) {
                    promises.push(consumers[i].addTraces(playerId, versionId, gameplayId, data, convertedData));
                }
                return Q.all(promises)
                    .then(function () {
                        return {
                            message: 'Success.'
                        };
                    }).fail(function (err) {
                        return Q.fcall(function () {
                            if (!err.status) {
                                err.status = 400;
                            }
                            throw err;
                        });
                    });
            });
        }
    };
})();