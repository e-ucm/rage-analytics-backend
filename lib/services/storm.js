'use strict';

var Q = require('q');
var shell = require('shelljs');
var Fs = require('fs');
var Path = require('path');
var Handlebars = require('handlebars');

var analysis = require('../analysis');

var storm = function (stormConfig, zookeeperUrl) {

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
                ' org.apache.storm.flux.Flux --remote ' + ymlPath;
            console.log('Shell executing command', command);
            shell.exec(command,
                {async: true},
                function (code, stdout, stderr) {
                    if (code !== 0) {
                        return callback({
                            message: 'Failed to end topology, code: ' + code +
                            ', stderr: ' + stderr + ', stdout: ' + stdout,
                            code: code
                        });
                    }
                    if (stderr) {
                        return callback({
                            message: 'Failed to end topology but exit code was 0, stderr: ' +
                            stderr + ', stdout: ' + stdout
                        });
                    }
                    callback(null, stdout);
                });
        });
    };

    return {
        startTopology: function (topologyName, kafkaTopicName, versionId) {
            return analysis.findById(analysis.toObjectID(versionId))
                .then(function (analysis) {

                    var deferred = Q.defer();

                    var config = {
                        topologyName: topologyName,
                        kafkaTopicName: kafkaTopicName,
                        zookeeperURL: zookeeperUrl,
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
                                return deferred.reject(new Error(err.message));
                            }
                            deferred.resolve(output);
                        });
                    };
                    // Check if the files in the uploaded /analysis folder exist
                    // If they exist, use them (expected: realtime.jar and flux.yaml)

                    function startDefault() {
                        // If the uploaded flux.yml file could not be read, try to start the default topology
                        Fs.readFile(configTemplatePath, fsOptions, function (err, src) {

                            if (err) {
                                // If the default flux.yml file couldn't be read, return an error;
                                return deferred.reject(new Error('Failed to read ' + configTemplatePath + ' template.'));
                            }

                            genDefaultYAMLAndLaunch(src);
                        });
                    }

                    if (analysis && analysis.fluxPath) {
                        // Try to read the uploaded flux.yml file
                        Fs.readFile(analysis.fluxPath, fsOptions, function (err, src) {

                            if (err) {
                                console.log('Failed to read ' + analysis.fluxPath + ' template.' +
                                    ' Proceeding with the default file: ' + configTemplatePath);

                                startDefault();
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
                    } else {
                        console.log('There is no uploaded analysis.' +
                            ' Proceeding with the default file: ' + configTemplatePath);

                        startDefault();
                    }

                    return deferred.promise;
                });
        },
        endTopology: function (sessionId) {
            var deferred = Q.defer();
            shell.exec(stormConfig.path + '/storm kill ' + sessionId.toString(),
                {async: true},
                function (code, stdout, stderr) {
                    if (code !== 0) {
                        return deferred.reject(new Error('Failed to end topology, code: ' + code +
                            ', stderr: ' + stderr + ', stdout: ' + stdout));
                    }
                    if (stderr) {
                        return deferred.reject(new Error('Failed to end topology but exit code was 0, stderr: ' +
                            stderr + ', stdout: ' + stdout));
                    }
                    deferred.resolve();
                });
            return deferred.promise;
        }
    };
};

module.exports = storm;
