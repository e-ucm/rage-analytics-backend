'use strict';

var app = {};
app.config = require('../../config-test');


var sessionId = "sessionTest";

var kafkaService = require('../../lib/services/kafka')(app.config.kafka.uri);

var expected = {};

var sendDataWithDelay = function (sessionId, trace, time) {
kafkaService.send(sessionId, [trace]);
	/*setTimeout( function() {
		kafkaService.send(sessionId, [trace]);
	}, time);*/
};

var _getAllFilesFromFolder = function (dir) {

    var filesystem = require("fs");

    var promises = [];

    var options = {
        encoding: 'utf-8'
    };

var tracesCount = 0;
    filesystem.readdirSync(__dirname + dir).forEach(function (file) {

//        var expectedData = JSON.parse(filesystem.readFileSync(__dirname + dir + '/../results/' + file, options));
        file = dir + '/' + file;
        console.log("reading: " + file);
      

 var data = JSON.parse(filesystem.readFileSync(__dirname + file, options));
tracesCount +=data.length;
//        expected[data[0].gameplayId] = expectedData;

	var i = 0;
	data.forEach(function(trace) {
		i +=100;
		sendDataWithDelay(sessionId, trace, i++);
		
	});
        //results.push(file);
    });

console.log('traces count', tracesCount);
    return promises;
    //return results;
};

//_getAllFilesFromFolder("/traces");
setTimeout(function () {
    _getAllFilesFromFolder("/traces");
    setTimeout(connectToDB, 3000);
}, 5000);


// Set database

var dbProvider = {
    db: function () {
        return this.database;
    }
};

var deepEqual = function (x, y) {
    console.log('deepEqual ', x, y);
    if ((typeof x === "object" && x !== null) && (typeof y === "object" && y !== null)) {
        if (Object.keys(x).length != Object.keys(y).length) {
            return false;
        }

        for (var prop in x) {
            console.log('checking property ' + prop);
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop])) {
                    return false;
                }
            }
            else {
                return false;
            }
        }

        return true;
    }
    else if (x !== y) {
        return false;
    } else {
        return true;
    }
};

var connectToDB = function () {
    var MongoClient = require('mongodb').MongoClient;
    var connectionString = app.config.mongodb.uri;
    MongoClient.connect(connectionString, function (err, db) {
        if (err) {
            console.log(err);
            console.log('Impossible to connect to MongoDB. Retrying in 5s');
            setTimeout(connectToDB, 5000);
        } else {
            console.log('Successfully connected to ' + connectionString);
            dbProvider.database = db;
            var db = require('../../lib/db');
            db.setDBProvider(dbProvider);


            var Collection = require('easy-collections');

            var sessionResults = new Collection(db, 'session' + sessionId.toString());

            sessionResults.find().
                then(function (result) {
                    console.log(JSON.stringify(result, null, 2));
                    console.log('expected Result:', JSON.stringify(expected, null, 2));

                    console.log('asddsaasddsa: ',expected[result[0]._id]);
/*
                    if (deepEqual(expected[result[0]._id], result[0])) {
                        console.log('deep equal');
                    }
                    
                     else {
                     console.err('not deep equal');		
                     }
   */                  
                    sessionResults.remove().
                        then(function (result) {
                            console.log('removed', JSON.stringify(result, null, 2));


                            var sessionOpaqueValues = new Collection(db, 'session_opaque_values_' + sessionId.toString());
                            sessionOpaqueValues.remove().
                                then(function (result) {
                                    console.log('removed opaque values', JSON.stringify(result, null, 2));
                                }).fail(function (err) {
                                    console.err(err);
                                });
                        }).fail(function (err) {
                            console.err(err);
                        });

                }).fail(function (err) {
                    console.err(err);
                });
        }
    });
};


//kafkaService.removeTopic(sessionId);
//stormService.endTopology(sessionId);
