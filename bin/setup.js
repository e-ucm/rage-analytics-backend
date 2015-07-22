#!/usr/bin/env node
'use strict';

/**
 * This file is used to generate 'config.js' (used during execution 'npm start') and
 * 'config-test.js' (used while testing 'npm test') files.
 *
 * In order to create the files, needs some predefined values stored in 'config-values.js'.
 * For more information about these values, checkout 'config-values.js'.
 *
 * config.js is generated using the 'defaultValues' from 'config-values.js'.
 * config-test.js is generated using the 'testValues' from 'config-values.js'.
 * *
 * Usage:
 *
 *      'npm run setup' - Generates the files asking the user for the values and suggesting the default values from 'config-values.js'.
 *      'npm run fast-setup' - Generates the files directly using the values from 'config-values.js'.
 *
 */

var Fs = require('fs');
var Path = require('path');
var Async = require('async');
var Mongodb = require('mongodb');
var Promptly = require('promptly');
var Handlebars = require('handlebars');

var configTemplatePath = Path.resolve(__dirname, '../config-example.js');
var configTestPath = Path.resolve(__dirname, '../config-test.js');
var configPath = Path.resolve(__dirname, '../config.js');

var configValue = require(Path.resolve(__dirname, '../config-values.js'));
var defaultValues = configValue.defaultValues;
var testValues = configValue.testValues;


if (process.env.NODE_ENV === 'test') {

    var options = {
        encoding: 'utf-8'
    };
    var source = Fs.readFileSync(configTemplatePath, options);
    var configTemplate = Handlebars.compile(source);
    Fs.writeFileSync(configPath, configTemplate(defaultValues));
    Fs.writeFileSync(configTestPath, configTemplate(testValues));
    console.log('Setup complete.');
    process.exit(0);

} else {
    Async.auto({

        projectName: function (done) {

            var promptOptions = {
                default: defaultValues.projectName || 'Learning Record Store'
            };

            Promptly.prompt('Project name: (' + promptOptions.default + ')', promptOptions, done);
        },
        companyName: ['projectName', function (done) {

            var promptOptions = {
                default: defaultValues.companyName || 'e-UCM Research Group'
            };

            Promptly.prompt('Company name: (' + promptOptions.default + ')', promptOptions, done);
        }],
        mongodbUrl: ['companyName', function (done) {

            var promptOptions = {
                default: defaultValues.mongodbUrl || 'mongodb://localhost:27017/lrs'
            };

            Promptly.prompt('MongoDB URL: (' + promptOptions.default + ')', promptOptions, done);
        }],
        testMongo: ['mongodbUrl', function (done, results) {
            Mongodb.MongoClient.connect(results.mongodbUrl, {}, function (err, db) {

                if (err) {
                    console.error('Failed to connect to Mongodb.');
                    return done(err);
                }

                db.close();
            });
            done(null, true);
        }],
        apiPath: ['testMongo', function (done) {

            var promptOptions = {
                default: defaultValues.apiPath || '/api'
            };

            Promptly.prompt('API root path: (' + promptOptions.default + ')', promptOptions, done);
        }],
        port: ['apiPath', function (done) {

            var promptOptions = {
                default: defaultValues.port || 3300
            };

            Promptly.prompt('API root path: (' + promptOptions.default + ')', promptOptions, done);
        }],
        createConfig: ['port', function (done, results) {

            var fsOptions = {
                encoding: 'utf-8'
            };

            Fs.readFile(configTemplatePath, fsOptions, function (err, src) {

                if (err) {
                    console.error('Failed to read config-example template.');
                    return done(err);
                }

                for (var result in results) {
                    if (results.hasOwnProperty(result)) {
                        defaultValues[result] = results[result];
                    }
                }

                var configTemplate = Handlebars.compile(src);
                Fs.writeFile(configPath, configTemplate(defaultValues), function (err) {
                    if (err) {
                        console.error('Failed to write config.js file.');
                        return done(err);
                    }
                    Fs.writeFile(configTestPath, configTemplate(testValues), done);
                });
            });
        }]
    }, function (err) {

        if (err) {
            console.error('Setup failed.');
            console.error(err);
            return process.exit(1);
        }

        console.log('Setup complete.');
        process.exit(0);
    });
}