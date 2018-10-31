'use strict';

var Q = require('q');
var shell = require('shelljs');
var Fs = require('fs');
var Handlebars = require('handlebars');

var storm = function (stormConfig, zookeeperUrl, kafkaUrl) {

    var genYMLAndLaunch = function (src, ymlPath, stormJar, config) {
        var deferred = Q.defer();

        var configTemplate = Handlebars.compile(src);
        Fs.writeFile(ymlPath, configTemplate(config), function (err) {
            if (err) {
                var retErr = {
                    message: 'Failed to write' + ymlPath + ' file, ' + err,
                    code: 0
                };
                return deferred.reject(retErr);
            }

            // Execute Topology
            var command = stormConfig.path + '/storm jar ' + stormJar +
                ' -c \'nimbus.seeds=["nimbus"]\' org.apache.storm.flux.Flux --remote ' + ymlPath;
            console.log('Shell executing command', command);
            shell.exec(command,
                {async: true},
                function (code, stdout, stderr) {
                    if (code !== 0) {
                        return deferred.reject({
                            message: 'Failed to end topology, code: ' + code +
                            ', stderr: ' + stderr + ', stdout: ' + stdout,
                            code: code
                        });
                    }
                    if (stderr) {
                        return deferred.reject({
                            message: 'Failed to end topology but exit code was 0, stderr: ' +
                            stderr + ', stdout: ' + stdout
                        });
                    }
                    deferred.resolve(stdout);
                });
        });

        return deferred.promise;
    };

    return {
        startTopology: function (topologyName, analysisFolder, kafkaTopicName) {
            var config = {
                topologyName: topologyName,
                kafkaTopicName: kafkaTopicName,
                zookeeperURL: zookeeperUrl,
                kafkaURL: kafkaUrl,
                elasticsearchUrl: stormConfig.elasticsearchHost
            };
            var fsOptions = {
                encoding: 'utf-8'
            };

            var tryLoadYAML = function(ymlPath) {
                var defyml = Q.defer();

                Fs.readFile(ymlPath, fsOptions, function (err, src) {
                    if (err) {
                        // If the default flux.yml file couldn't be read, return an error;
                        return defyml.reject(new Error('Failed to read ' + ymlPath));
                    }

                    defyml.resolve(src);
                });

                return defyml.promise;
            };
            // Check if the files in the uploaded /analysis folder exist
            // If they exist, use them (expected: realtime.jar and flux.yaml)

            function startAnalysis(folder) {
                var ymlpath = folder + 'flux.yml';

                // If the uploaded flux.yml file could not be read, try to start the default topology
                return tryLoadYAML(ymlpath)
                    .then(function(src) {
                        return genYMLAndLaunch(src, folder + 'fluxinstance.yml', folder + 'realtime.jar', config);
                    });
            }


            return startAnalysis(analysisFolder);
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