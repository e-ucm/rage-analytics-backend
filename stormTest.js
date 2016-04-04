'use strict';


var app = {};
app.config = require('./config-test');


var sessionId = "sessionTest";

var kafkaService = require('./lib/services/kafka')(app.config.kafka.uri);


try{
    var task = kafkaService.createTopic;
    task.call(null, sessionId).then(function(result){
			console.log('finished creating kafka topic, result', result);
		
		
	    }, function(err) {
			console.log('error creating kafka topic: ', err);
			setTimeout(function () {
				var task = kafkaService.createTopic;
				task.call(null, sessionId)
					.then(function(result){
							console.log('finished creating kafka topic (secondTime), result', result);
		
		
					      }, function(err) {
							console.log('error creating kafka topic(secondTime) : ', err);

					});
			    }, 1000);
	});
} catch(e){
    setTimeout(function () {
        var task = kafkaService.createTopic;
        task.call(null, sessionId)
		.then(function(result){
				console.log('finished creating kafka topic (secondTime), result', result);
		
		
		      }, function(err) {
				console.log('error creating kafka topic(secondTime) : ', err);

		});
    }, 1000);
}

var stormService = require('./lib/services/storm')(app.config.storm, app.config.mongodb.uri, app.config.kafka.uri);

var task = stormService.startTopology;
task.call(null, sessionId)
		.then(function(result){
			console.log('start storm topology : ', result);
		    }, function(err) {
				console.log('error starting storm topology : ', err);

		});


//kafkaService.removeTopic(sessionId);
//stormService.endTopology(sessionId);
