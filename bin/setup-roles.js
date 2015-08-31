#!/usr/bin/env node
'use strict';

/**
 * This file issues the needed requests to set up the gleaner application
 * with the roles defined in the 'lrs-roles.js' file.
 *
 */

var Path = require('path');
var request = require('request');
var config = require(Path.resolve(__dirname, '../config.js'));
var appData = require(Path.resolve(__dirname, '../lrs-roles.js')).app;

var baseUsersAPI = 'http://localhost:3000/api/';

request.post(baseUsersAPI + 'login', {
        form: {
            'username': 'root',
            'password': 'root'
        },
        json: true
    },
    function (err, httpResponse, body) {
        if (err) {
            console.log(err);
            return process.exit(0);
        }

        appData.name = config.projectName;
        appData.prefix = 'gleaner';
        appData.host = 'http://localhost:' + config.port + '/api/';

        request({
            uri: baseUsersAPI + 'applications',
            method: 'POST',
            body: appData,
            json: true,
            headers: {
                'Authorization': 'Bearer ' + body.user.token
            }
        }, function (err, httpResponse, body) {
            if (err) {
                console.log(err);
                return process.exit(0);
            }

            console.log('Application and roles setup complete.');
            process.exit(0);
        });
    });


