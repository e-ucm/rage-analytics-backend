'use strict';

var Q = require('q');
var shell = require('shelljs');
var Fs = require('fs');
var Path = require('path');
var Handlebars = require('handlebars');

var analysis = require('../analysis');

var storm = function (stormConfig, mongodbUrl, zookeeperUrl) {

    var genYMLAndLaunch = function (src, ymlPath, stormJar, config, callback) {

        var configTemplate = Handlebars.compile(src);
        Fs.writeFile(ymlPath, configTemplate(config), function (err) {
            if (err) {
                var retErr = {
                    message: 'Failed to write' + ymlPath + ' file, ' + err,
                    code: 0
                };
                return callback(retErr);
            }

            // Execute Topology
            var command = stormConfig.path + '/storm jar ' + stormJar +
                ' org.apache.storm.flux.Flux --remote ' + ymlPath + ' -c nimbus.host=' + stormConfig.nimbusHost;
            console.log('Shell executing command', command);
            shell.exec(command,
                {async: true},
                function (code, output) {
                    if (code !== 0) {
                        var error = {
                            message: 'Failed to start topology, code: ' + code + ', output: ' + output,
                            code: code
                        };
                        return callback(error);
                    }
                    callback(null, output);
                });
        });
    };

    return {
        startTopology: function (sessionId, versionId) {
            return analysis.findById(analysis.toObjectID(sessionId)).then(function (analysis) {

                var deferred = Q.defer();

                var partsStr = mongodbUrl.split('://')[1];
                var parts = partsStr.split('/');
                var hostPort = parts[0].split(':');

                var config = {
                    sessionId: sessionId,
                    zookeeperURL: zookeeperUrl,
                    mongoHost: hostPort[0],
                    mongoPort: parseInt(hostPort[1]),
                    mongoDB: parts[1],
                    elasticsearchUrl: stormConfig.elasticsearchHost
                };

                var configTemplatePath = Path.resolve(__dirname, '../../default-flux.yml');
                var configPath = Path.resolve(__dirname, '../../' + stormConfig.fluxYaml);
                var fsOptions = {
                    encoding: 'utf-8'
                };

                var genDefaultYAMLAndLaunch = function (src) {
                    // If the Uploaded flux.yml file could be read, try to start the topology
                    genYMLAndLaunch(src, configPath, stormConfig.realtimeJar, config, function (err, output) {
                        if (err) {
                            console.log(err.message);

                            return deferred.reject(new Error(err.message));
                        }
                        deferred.resolve(output);
                    });
                };
                // Check if the files in the uploaded /analysis folder exist
                // If they exist, use them (expected: realtime.jar and flux.yaml)

                // Try to read the uploaded flux.yml file
                Fs.readFile(analysis.fluxPath, fsOptions, function (err, src) {

                    if (err) {
                        console.log('Failed to read ' + analysis.fluxPath + ' template.' +
                            ' Proceeding with the default file: ' + configTemplatePath);

                        // If the uploaded flux.yml file could not be read, try to start the default topology
                        Fs.readFile(configTemplatePath, fsOptions, function (err, src) {

                            if (err) {
                                // If the default flux.yml file couldn't be read, return an error;
                                return deferred.reject(new Error('Failed to read ' + configTemplatePath + ' template.'));
                            }

                            genDefaultYAMLAndLaunch(src);
                        });
                    } else {

                        // If the Uploaded flux.yml file could be read, try to start the topology
                        genYMLAndLaunch(src, configPath, analysis.realtimePath, config, function (err, output) {
                            if (err) {
                                // Something failed when launching the uploaded topology or generating the uploaded flux.yml
                                console.log(err.message);

                                // If the uploaded flux.yml file could not be read, try to start the default topology
                                Fs.readFile(configTemplatePath, fsOptions, function (err, src) {

                                    if (err) {
                                        // If the default flux.yml file couldn't be read, return an error;
                                        return deferred.reject(new Error('Failed to read ' + configTemplatePath + ' template.'));
                                    }
                                    genDefaultYAMLAndLaunch(src);
                                });
                                return;
                            }
                            deferred.resolve(output);
                        });
                    }
                });

                return deferred.promise;
            });
        },
        endTopology: function (sessionId) {
            var deferred = Q.defer();
            shell.exec(stormConfig.path + '/storm kill ' + sessionId.toString(),
                {async: true},
                function (code, output) {
                    if (code !== 0) {
                        return deferred.reject(new Error('Failed to end topology, code: ' + code + ', output: ' + output));
                    }
                    deferred.resolve();
                });
            return deferred.promise;
        }
    };
};

module.exports = storm;
