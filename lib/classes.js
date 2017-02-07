'use strict';

module.exports = (function () {
    var Collection = require('easy-collections');
    var db = require('./db');
    var utils = require('./utils');
    var games = require('./games');
    var classes = new Collection(db, 'classes');
    var sessionsCollection = new Collection(db, 'sessions');

    classes.sort = {
        _id: -1
    };

    /**
     * Returns the classes for gameId:versionId
     */
    classes.getClasses = function (gameId, versionId) {
        gameId = classes.toObjectID(gameId);
        versionId = classes.toObjectID(versionId);
        return classes.find({gameId: gameId, versionId: versionId});
    };


    /**
     * Returns the classes where a user participates
     */
    classes.getUserClasses = function (gameId, versionId, user) {
        gameId = classes.toObjectID(gameId);
        versionId = classes.toObjectID(versionId);
        return classes.find({
                $or: [
                    {gameId: gameId, versionId: versionId, teachers: user},
                    {gameId: gameId, versionId: versionId, students: user}
                ]
            }
        );
    };


    /**
     * Creates a new class for the given gameId:versionId.
     * @Returns a promise with the class created
     */
    classes.createClass = function (gameId, versionId, username, name) {
        return getGame(gameId).then(function (result) {
            return classes.insert({
                gameId: result._id,
                versionId: classes.toObjectID(versionId),
                name: name,
                created: new Date(),
                authors: [username],
                teachers: [username],
                students: []
            });
        });
    };

    classes.removeClass = function (classId, username) {
        return classes.findById(classId)
            .then(function (classRes) {
                if (!classRes) {
                    throw {
                        message: 'Class does not exist',
                        status: 400
                    };
                }

                if (!classRes.authors || classRes.authors.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to delete this class.',
                        status: 401
                    };
                }

                return classes.removeById(classId).then(function (result, err) {
                    if (!err) {
                        return {
                            message: 'Success.'
                        };
                    }
                });
            });
    };

    classes.modifyClass = function (classId, username, body, add) {
        return classes.find(classes.toObjectID(classId), true)
            .then(function (classRes) {
                if (!classRes) {
                    throw {
                        message: 'Class does not exist',
                        status: 400
                    };
                }

                if (!classRes.authors || classRes.authors.indexOf(username) === -1) {
                    throw {
                        message: 'You don\'t have permission to modify this class.',
                        status: 401
                    };
                }

                if (body._id) {
                    delete body._id;
                }

                if (body.versionId) {
                    delete body.versionId;
                }

                var update = {};
                utils.addToArrayHandler(update, body, 'teachers', add);
                utils.addToArrayHandler(update, body, 'students', add);

                if (add) {
                    if (body.name && typeof body.name === 'string') {
                        update.$set = {};
                        update.$set.name = body.name;
                    }
                }

                return classes.findAndUpdate(classId, update);
            });
    };

    var getGame = function (gameId) {
        return games.findById(gameId).then(function (game) {
            if (!game) {
                throw {
                    message: 'Game does not exist',
                    status: 400
                };
            }
            return game;
        });
    };

    classes.preRemove(function(_id, next) {
        var classesId = _id.toString();
        sessionsCollection.remove({
            classesId: classesId
        }).then(function () {
            next();
        }).fail(function() {
            next();
        });
    });


    return classes;
})();