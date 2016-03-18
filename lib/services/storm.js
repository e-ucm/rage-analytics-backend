'use strict';

var Q = require('q');
var shell = require('shelljs');
var Fs = require('fs');
var Path = require('path');
var Handlebars = require('handlebars');

var storm = function (stormConfig, mongodbUrl, zookeeperUrl) {

    return {
        startTopology: function (sessionId) {
            var deferred = Q.defer();

            var partsStr = mongodbUrl.split("://")[1];
            var parts = partsStr.split("/");
            var hostPort = parts[0].split(":");

            var config = {
                sessionId :sessionId,
                zookeeperURL: zookeeperUrl,
                mongoHost: hostPort[0],
                mongoPort: parseInt(hostPort[1]),
                mongoDB: parts[1]
            };
            var configTemplatePath = Path.resolve(__dirname, '../../default-flux.yml');
            var configPath = Path.resolve(__dirname, '../../flux.yml');
            var fsOptions = {
                encoding: 'utf-8'
            };
            Fs.readFile(configTemplatePath, fsOptions, function (err, src) {

                if (err) {
                    return deferred.reject(new Error('Failed to read default-flux.yml template.'));
                }

                var configTemplate = Handlebars.compile(src);
                Fs.writeFile(configPath, configTemplate(config), function (err) {
                    if (err) {
                        return deferred.reject(new Error('Failed to write flux.yml file.'));
                    }

                    //Execute Topology
                    var command = stormConfig.path + '/storm jar ' + stormConfig.realtimeJar +
                        ' org.apache.storm.flux.Flux --remote '+ stormConfig.fluxYaml + ' -c nimbus.host=' + stormConfig.nimbusHost;
                    console.log('Shell executing command', command);
                    shell.exec(command,
                        {async: true},
                        function (code, output) {
                            if (code !== 0) {
                                return deferred.reject(new Error('Failed to start topology, code: ' + code + ', output: ' + output));
                            }
                            deferred.resolve();
                        });
                });
            });

            return deferred.promise;
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
