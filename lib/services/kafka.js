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
            producer().send([{topic: topic, messages: messages}], function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(true);
                }
            });
            return deferred.promise;
        },
        createTopic: function (sessionId) {
            var deferred = Q.defer();
            producer().createTopics([sessionId.toString()], function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });
            return deferred.promise;
        },
        removeTopic: function (sessionId) {
            var deferred = Q.defer();
            consumer().removeTopics([sessionId.toString()], function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });
            return deferred.promise;
        }
    };
};

module.exports = kafkaService;
