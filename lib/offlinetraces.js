'use strict';

module.exports = function () {

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
    var XLSX = require('xlsx');

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

    var storageKahoot = multer.diskStorage({
        destination: function (req, file, cb) {
            var pathDir = './offlinetraceskahoot/' + req.params.activityId + '/';
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
            if (file.originalname.indexOf('.xlsx') === -1) {
                return cb({
                    message: 'Required "xlsx" extension, received ' + file.originalname,
                    status: 400
                });
            }
            cb(null, req.params.filename);
        }
    });
    var uploadKahoot = multer({ // Kahoot Multer settings
        storage: storageKahoot
    }).single('offlinetraceskahoot');


    var uploadPromise = function (req, res, kahoot) {
        var deferred = Q.defer();
        if (kahoot) {
            uploadKahoot(req, res, function (err) {
                if (err) {
                    deferred.reject({
                        message: JSON.stringify(err),
                        status: err.status || 400
                    });
                } else {
                    deferred.resolve();
                }
            });
        } else {
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
        }
        return deferred.promise;
    };

    function kahootToCSV(file) {
        try {
            var buf = fs.readFileSync(file);
            var wb = XLSX.read(buf, {type: 'buffer'});
            var sheets = wb.SheetNames;

            var questionTag = 'Question ';

            var nowTime = Date.now();
            var totalTime = 0;
            var questions = {};
            /*jshint -W069 */
            /*Disable Warning Justification:
                Using bracket notation so Google Closure Compiler
                ADVANCED_OPTIMIZATIONS will keep the original property names. */
            var questionId = 1;

            while (sheets.indexOf(questionTag + questionId) !== -1) {
                var sheet = wb.Sheets[questionTag + questionId];
                var c5cell = sheet['C5'];
                if (!c5cell) {
                    return {
                        error: 'No time (C5) value found on sheet ' + questionTag + questionId
                    };
                }
                var timeValue = c5cell.v;
                var time = parseInt(timeValue.substring(0, timeValue.length - ' seconds'.length));
                totalTime += time;
                questions[questionTag + questionId] = {
                    sheet: sheet,
                    time: time
                };
                questionId++;
            }

            var startTime = nowTime - (totalTime * 1000);

            var csvtraces = [];
            for (var question in questions) {
                var traceTime = startTime;
                var questionSheet = questions[question].sheet;
                var questionTime = questions[question].time;

                var playerTag = 'A';
                var playerId = 15;

                var questionCell = questionSheet['B2'];
                if (!questionCell) {
                    return {
                        error: 'No question text (B2) value found on sheet ' + question
                    };
                }
                var questionText = questionCell.v;
                while (questionSheet[playerTag + playerId]) {
                    var currentTrace = '';
                    var playerNameCell = questionSheet[playerTag + playerId];
                    if (!playerNameCell) {
                        return {
                            error: 'No player cell (' + playerTag + playerId + ') value found on sheet ' + question
                        };
                    }
                    var playerName = playerNameCell.v;

                    currentTrace += (playerName + ',' + traceTime + ',selected,alternative,' + questionText + ',');

                    var playerCell = questionSheet['C' + playerId];

                    if (!playerCell) {
                        return {
                            error: 'No player cell (C' + playerId + ') value found on sheet ' + question
                        };
                    }
                    if (playerCell.v === '✘') {
                        currentTrace += 'success,false,';
                    } else {
                        currentTrace += 'success,true,';
                    }

                    var responseCell = questionSheet['D' + playerId];
                    if (!responseCell) {
                        return {
                            error: 'No response cell (D' + playerId + ') value found on sheet ' + question
                        };
                    }
                    var response = responseCell.v;

                    currentTrace += 'response,' + response + ',';

                    var scoreCell = questionSheet['G' + playerId];
                    if (!scoreCell) {
                        return {
                            error: 'No score cell (G' + playerId + ') value found on sheet ' + question
                        };
                    }

                    var score = scoreCell.v;

                    currentTrace += 'score,' + score;

                    var nextTime = Math.floor(Math.random() * questionTime) + 1;

                    traceTime += (nextTime * 1000);

                    csvtraces.push(currentTrace);
                    playerId++;
                }

                startTime += (questionTime * 1000);
            }

            /*jshint +W069 */
            return csvtraces;
        } catch (err) {
            return {
                error: 'Unexpected error: ' + err.toString()
            };
        }
    }

    /**
     * Creates a new offlinetraces for the given activityId.
     * @Returns a promise with the analysis created
     */
    offlinetraces.createOfflinetraces = function (activityId, username, req, res, kahoot) {
        activityId = offlinetraces.toObjectID(activityId);
        var nofileMessage = '';
        var trackingCode = '';
        // 1 - Check if anactivity exists for the given activityId
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
                // 2 - Insert new OfflineTracesObject
                // (we don't know the name of the file yet, only after uploading it)
                return offlinetraces.insert({
                    name: '',
                    kahoot: kahoot,
                    activityId: activityId,
                    timestamp: new Date(),
                    author: username
                });
            })
            .then(function (offlinetrace) {
                // 3 - Upload the file in the corresponding folder
                // './offlinetraces/' + req.params.activityId + '/' + filename;
                req.params.filename = offlinetrace._id.toString();

                return uploadPromise(req, res, kahoot);
            })
            .then(function (err) {
                if (err) {
                    throw err;
                }

                if (!req.file) {
                    if (!kahoot) {
                        nofileMessage = 'You must upload a .csv file with the traces in the correct CSV format';
                    } else {
                        nofileMessage = 'You must upload a .xlsx file with the traces in the correct Kahoot format. ' +
                            'The file is called "results.xlsx" when downloading the results of a Kahoot session (kahoot responses file).';
                    }
                    throw {
                        message: nofileMessage,
                        status: 400
                    };
                }

                // 4 - Now that we know the name, update the original 'offlinetraces' object.name
                return offlinetraces.findAndModify(offlinetraces.toObjectID(req.params.filename), {name: req.file.originalname});
            })
            .then(function (result) {
                // 5 - Send traces to Kafka using CO (* and yield functions)

                var sendTraces = function* () {
                    // This is a * function that can be used with 'yield' to make it synchronous
                    var isTest = (process.env.NODE_ENV === 'test');
                    if (isTest) {
                        return {
                            message: 'Success.'
                        };
                    }

                    function checkIsCSV(data) {
                        if (data.length < 5) {
                            return false;
                        }
                        if (data.indexOf(',') === -1) {
                            return false;
                        }

                        return true;
                    }

                    var csvtraces = null;
                    if (kahoot) {

                        csvtraces = kahootToCSV(req.file.path);
                        if (csvtraces.error) {
                            return csvtraces;
                        }

                    } else {
                        var data = fs.readFileSync(req.file.path, 'utf8');

                        if (!checkIsCSV(data)) {
                            return {
                                error: 'File contents is not a valid CSV format.'
                            };
                        }

                        csvtraces = data.split(/\r\n|\n/);
                    }

                    var users = {};
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
                    return yield sendTraces();
                });
            });
    };

    offlinetraces.kahootToCSV = kahootToCSV;

    /**
     * Get offlinetraces for the given activityId.
     * @Returns a promise with the analysis created
     */
    offlinetraces.findByActivityId = function (activityId, username, kahoot) {

        activityId = offlinetraces.toObjectID(activityId);
        return offlinetraces.find(
            {
                $and: [
                    {
                        activityId: activityId
                    },
                    {
                        author: username
                    },
                    {
                        kahoot: kahoot
                    }
                ]
            });
    };

    return offlinetraces;
};