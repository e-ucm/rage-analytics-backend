'use strict';


var sessionId = "sessionTest";

var app = { };
app.config = require('./config-test');

var kafkaService = require('../lib/services/kafka')(app.config.kafka.uri);

var task = kafkaService.removeTopic;
task.call(null, sessionId)
	.then(function(result){
			console.log('finished removing kafka topic, result', result);
		
		
	    }, function(err) {
			console.log('error removing kafka topic: ', err);

	});

var stormService = require('../lib/services/storm')(app.config.storm, app.config.mongodb.uri, app.config.kafka.uri);

var task = stormService.endTopology;
task.call(null, sessionId).then(function(result){
		console.log('finished killing storm topology, result', result);
	}, function(err) {
		console.log('error killing storm topology: ', err);
	}
);

