'use strict';


var app = {};
app.config = require('./config-test');


var sessionId = "sessionTest";

var kafkaService = require('./lib/services/kafka')(app.config.kafka.uri);


var _getAllFilesFromFolder = function(dir) {

    var filesystem = require("fs");

    var promises = [];

    var options = {
        encoding: 'utf-8'
    };

    filesystem.readdirSync(__dirname + dir).forEach(function(file) {
        file = dir+'/'+file;
        console.log("reading: "+file);
        var data = JSON.parse(filesystem.readFileSync(__dirname + file, options));

            promises.push(kafkaService.send(sessionId, data));
        //results.push(file);
    });
    return promises;
    //return results;
};

_getAllFilesFromFolder("/traces");
setTimeout(function () {
			_getAllFilesFromFolder("/traces");
	}, 5000);


			


//kafkaService.removeTopic(sessionId);
//stormService.endTopology(sessionId);
