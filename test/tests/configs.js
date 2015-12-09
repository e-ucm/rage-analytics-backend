'use strict';

var should = require('should');

var config;
var configValues;
var testConfig;

describe('Config files  validations', function () {

    it('should return a correct config-values file', function (done) {
            configValues = require('../../config-values.js');
            var keys = Object.keys(configValues);
            should(keys.length).equal(2);
            should(keys).containDeep(['defaultValues', 'testValues']);

            var defaultKeys = Object.keys(configValues.defaultValues);
            var testKeys = Object.keys(configValues.testValues);
            should(defaultKeys.length).equal(testKeys.length);
            should(defaultKeys).containDeep(testKeys);

            done();
        });

    it('should have generated correctly the config files', function (done) {
            config = require('../../config.js');
            testConfig = require('../../config-test.js');

            var configKeys = Object.keys(config);
            var testConfigKeys = Object.keys(testConfig);

            should(configKeys.length).equal(testConfigKeys.length);
            should(configKeys).containDeep(testConfigKeys);

            var toType = function (obj) {
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
            };

            configKeys.forEach(function (configKey) {
                should(toType(configKeys[configKey])).equal(toType(testConfigKeys[configKey]));
            });

            var defaultKeys = Object.keys(configValues.defaultValues);
            var testKeys = Object.keys(configValues.testValues);
            should(defaultKeys.length).equal(testKeys.length);
            should(defaultKeys).containDeep(testKeys);

            done();
        });


    it('should have a correct content (config files)', function (done) {
            /**
             *   exports.port = process.env.PORT || '3300';
             *   exports.mongodb = {
         *       uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/analytics-backend'
         *   };
             *   exports.apiPath = '/api';
             *   exports.companyName = 'e-UCM Research Group';
             *   exports.projectName = 'Rage Analytics Backend';
             *   exports.lrs = {
         *       uri: process.env.LRS_URI || process.env.LRS_URL || 'http://localhost:8080/xAPI/',
         *       username: 'openlrs',
         *       password: 'openlrs'
         *   };
             *   exports.storm = {
         *       realtimeJar: '/home/eucm/hlocal/rage2/rage-analytics-realtime/target/realtime-jar-with-dependencies.jar',
         *       path: '/home/eucm/hlocal/rage/gleaner/storm/apache-storm-0.9.5/bin',
         *       nimbusHost: 'localhost'
         *   };
             *   exports.kafka = {
         *       uri: process.env.LRS_URI || process.env.LRS_URL || 'localhost:2181'
         *   };
             *   exports.a2 = {
         *       a2ApiPath: 'http://localhost:3000/api/',
         *       a2AdminUsername: 'root',
         *       a2AdminPassword: 'root'
         *   };
             */

            should(config.port).be.a.String();
            should(config.mongodb).be.an.Object();
            should(config.mongodb.uri).be.a.String();
            should(config.apiPath).be.a.String();
            should(config.companyName).be.a.String();
            should(config.projectName).be.a.String();
            should(config.lrs).be.an.Object();
            should(config.lrs.uri).be.a.String();
            should(config.lrs.uri.indexOf('http')).equal(0);
            should(config.lrs.username).be.a.String();
            should(config.lrs.password).be.a.String();
            should(config.storm).be.an.Object();
            should(config.storm.realtimeJar).be.a.String();
            should(config.storm.path).be.a.String();
            should(config.storm.nimbusHost).be.a.String();
            should(config.kafka).be.an.Object();
            should(config.kafka.uri).be.a.String();
            should(config.a2).be.an.Object();
            should(config.a2.a2ApiPath).be.a.String();
            should(config.a2.a2ApiPath.indexOf('http')).equal(0);
            should(config.a2.a2HomePage).be.a.String();
            should(config.a2.a2HomePage.indexOf('http')).equal(0);
            should(config.a2.a2Prefix).be.a.String();
            should(config.a2.a2AdminUsername).be.a.String();
            should(config.a2.a2AdminPassword).be.a.String();

            should(testConfig.port).be.a.String();
            should(testConfig.mongodb).be.an.Object();
            should(testConfig.mongodb.uri).be.a.String();
            should(testConfig.apiPath).be.a.String();
            should(testConfig.companyName).be.a.String();
            should(testConfig.projectName).be.a.String();
            should(testConfig.lrs).be.an.Object();
            should(testConfig.lrs.uri).be.a.String();
            should(testConfig.lrs.uri.indexOf('http')).equal(0);
            should(testConfig.lrs.username).be.a.String();
            should(testConfig.lrs.password).be.a.String();
            should(testConfig.storm).be.an.Object();
            should(testConfig.storm.realtimeJar).be.a.String();
            should(testConfig.storm.path).be.a.String();
            should(testConfig.storm.nimbusHost).be.a.String();
            should(testConfig.kafka).be.an.Object();
            should(testConfig.kafka.uri).be.a.String();
            should(testConfig.a2).be.an.Object();
            should(testConfig.a2.a2ApiPath).be.a.String();
            should(testConfig.a2.a2ApiPath.indexOf('http')).equal(0);
            should(testConfig.a2.a2HomePage).be.a.String();
            should(testConfig.a2.a2HomePage.indexOf('http')).equal(0);
            should(testConfig.a2.a2Prefix).be.a.String();
            should(testConfig.a2.a2AdminUsername).be.a.String();
            should(testConfig.a2.a2AdminPassword).be.a.String();

            should(config.mongodb.uri).not.equal(testConfig.mongodb.uri);

            done();
        });
});
