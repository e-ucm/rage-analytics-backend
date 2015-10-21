#!/usr/bin/env node
'use strict';

/**
 * This file issues the needed requests to set up the gleaner application
 * with the roles defined in the 'a-backend-roles.js' file.
 *
 */

var Path = require('path');
var request = require('request');
var config = require(Path.resolve(__dirname, '../config.js'));
var appData = require(Path.resolve(__dirname, '../a-backend-roles.js')).app;

var baseUsersAPI = config.a2.a2ApiPath;

request.post(baseUsersAPI + 'login', {
        form: {
            username: config.a2.a2AdminUsername,
            password: config.a2.a2AdminPassword
        },
        json: true
    },
    function (err, httpResponse, body) {
        if (err) {
            console.error(err);
            if (err.errno && err.errno.indexOf('ECONNREFUSED') > -1) {
                console.error('Could not connect to MongoDB!');
                return process.exit(-1);
            }
            console.log('Did not register the backend with A2, continuing anyway!');
            return process.exit(0);
        }

        appData.name = config.projectName;
        appData.prefix =  config.a2.a2Prefix;
        appData.host = 'http://' + config.myHost + ':' + config.port + config.apiPath;

        request({
            uri: baseUsersAPI + 'applications',
            method: 'POST',
            body: appData,
            json: true,
            headers: {
                Authorization: 'Bearer ' + body.user.token
            }
        }, function (err) {
            if (err) {
                console.error(err);
                if (err.errno && err.errno.indexOf('ECONNREFUSED') > -1) {
                    console.error('Could not connect to MongoDB!');
                    return process.exit(-1);
                }
                console.log('Did not register the backend with A2, continuing anyway!');
                return process.exit(0);
            }

            console.log('Application and roles setup complete.');
            process.exit(0);
        });
    });


