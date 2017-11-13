'use strict';

var Q = require('q');
var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    HighLevelProducer = kafka.HighLevelProducer;


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
                console.log('Producer ready');
            });

            pr.on('error', function (err) {
                console.log('Producer error', err);
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
                console.log('Consumer message', message);
            });

            co.on('error', function (err) {
                console.log('Consumer error', err);
            });

            co.on('offsetOutOfRange', function (err) {
                console.log('Consumer offsetOutOfRange', err);
            });
        }
        return co;
    };

    producer();
    consumer();

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
        createTopic: function (topicName) {
            var deferred = Q.defer();
            producer().createTopics([topicName.toString()], true, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(data);
                }
            });
            return deferred.promise;
        },
        removeTopic: function (topicName) {
            var deferred = Q.defer();
            consumer().removeTopics([topicName.toString()], function (err, removed) {
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
