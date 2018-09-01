'use strict';

module.exports = function (kafkaConfig) {

    //  Var kafka = require('./services/kafka')(kafkaConfig.uri);
    var collector = require('./collector');
    var csvToXapi = require('./csvToXAPI');
    var Q = require('q');
    var Collection = require('easy-collections');
    var db = require('./db');
    var offlinetraces = new Collection(db, 'offlinetraces');
    var activities = require('./activities');
    var mkdirp = require('mkdirp');
    var multer = require('multer');
    var fs = require('fs');
    let co = require('co');
    // Var async = require('async');

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            var pathDir = './offlinetraces/' + req.params.activityId + '/';
            mkdirp(pathDir, function (err) {
                if (err) {
                    console.error(JSON.stringify(err));
                    cb(err);
                } else {
                    cb(null, pathDir);
                }
            });
        },
        filename: function (req, file, cb) {
            if (file.mimetype.indexOf('csv') === -1 &&
                file.originalname.indexOf('.csv') === -1) {
                return cb({
                    message: 'Required csv, received ' + file.originalname,
                    status: 400
                });
            }
            cb(null, req.params.filename);
        }
    });
    var upload = multer({ // Multer settings
        storage: storage
    }).single('offlinetraces');

    var uploadPromise = function (req, res) {
        var deferred = Q.defer();
        upload(req, res, function (err) {
            if (err) {
                deferred.reject({
                    message: JSON.stringify(err),
                    status: err.status || 400
                });
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    };

    /**
     * Creates a new offlinetraces for the given activityId.
     * @Returns a promise with the analysis created
     */
    offlinetraces.createOfflinetraces = function (activityId, username, req, res) {

        activityId = offlinetraces.toObjectID(activityId);
        var trackingCode = '';
        return activities.findById(activityId)
            .then(function (analysisResult) {
                if (!analysisResult) {
                    throw {
                        message: 'No activity found with the given id: ' + activityId,
                        status: 400
                    };
                }
                if (!analysisResult.offline) {
                    throw {
                        message: 'Activity is not of type offline: ' + activityId,
                        status: 400
                    };
                }

                trackingCode = analysisResult.trackingCode;
                return offlinetraces.insert({
                    name: '',
                    activityId: activityId,
                    timestamp: new Date(),
                    author: username
                });
            })
            .then(function (offlinetrace) {
                req.params.filename = offlinetrace._id.toString();

                return uploadPromise(req, res);
            })
            .then(function (err) {
                if (err) {
                    throw err;
                }
                // Read req.file.path and send to kafka
                // Reading archives

                if (!req.file) {
                    throw {
                        message: 'You must upload a .csv file with the traces in the correct CSV format',
                        status: 400
                    };
                }

                return offlinetraces.findAndModify(offlinetraces.toObjectID(req.params.filename), {name: req.file.originalname});
            })
            .then(function (result) {

                console.log('result');
                console.info(result);


                var sendTraces = function* () {

                    var users = {};
                    var data = fs.readFileSync(req.file.path, 'utf8');

                    var csvtraces = data.split('\n');

                    for (var i = 0; i < csvtraces.length; ++i) {
                        var trace = csvtraces[i];
                        var resp = csvToXapi(trace);

                        if (!resp.error) {
                            var statement = resp.statement;

                            var authorization = users[statement.actor.name];
                            if (!authorization) {
                                authorization = yield collector.start([], trackingCode, '', statement.actor.name);
                                users[statement.actor.name] = authorization;
                            }

                            yield collector.track(authorization.authToken, [resp.statement]);

                        } else {
                            console.log(resp.error);
                        }
                    }

                    return {
                        message: 'Success.'
                    };
                };

                return co(function* () {
                    console.log('wrap 1');
                    return yield sendTraces();
                });
                /*.catch(function (err) {
                    // Log any uncaught errors
                    // co will not throw any errors you do not handle!!!
                    // HANDLE ALL YOUR ERRORS!!!
                    console.log('Error while sending traces to collector!');
                    console.error(err);
                    return err;
                });*/
            });
    };

    /**
     * Get offlinetraces for the given activityId.
     * @Returns a promise with the analysis created
     */
    offlinetraces.findByActivityId = function (activityId, username) {

        activityId = offlinetraces.toObjectID(activityId);
        return offlinetraces.find({$and: [{activityId: activityId}, {author: username}]});
    };

    return offlinetraces;
};