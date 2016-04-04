'use strict';

var Q = require('q');
var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    HighLevelProducer = kafka.Producer;


var kafkaService = function (clientUri) {
    var cl;
    var pr;
    var co;

    var client = function () {
        if (!cl) {
            cl = new kafka.Client(clientUri);
        }
        return cl;
    };

    var producer = function () {
        if (!pr) {
            pr = new HighLevelProducer(client());

		pr.on('ready', function () {
		    console.log('producer ready');
		});

		pr.on('error', function(err) {

			console.log('producer error', err);
		});

        }
        return pr;

    };

    var consumer = function () {
        if (!co) {
            co = new Consumer(
                client(),
                [],
                {
                    autoCommit: false
                }
            );

		co.on('message', function (message) {
		    console.log('client message', message);
		});

		co.on('error', function(err) {

			console.log('client error', err);
		});

		co.on('offsetOutOfRange', function(err) {

			console.log('client offsetOutOfRange', err);
		});
        }
        return co;
    };

    return {
        send: function (topic, data) {
            var deferred = Q.defer();
            var messages = [];
            data.forEach(function (value) {
                messages.push(JSON.stringify(value));
            });
            producer().send([{topic: topic, messages: messages}], function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(data);
                }
            });
            return deferred.promise;
        },
        createTopic: function (sessionId) {
            var deferred = Q.defer();
            producer().createTopics([sessionId.toString()], function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(data);
                }
            });
            return deferred.promise;
        },
        removeTopic: function (sessionId) {
            var deferred = Q.defer();
            consumer().removeTopics([sessionId.toString()], function (err, removed) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(removed);
                }
            });
            return deferred.promise;
        }
    };
};

module.exports = kafkaService;
