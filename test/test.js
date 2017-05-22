/*
 * Copyright 2016 e-UCM (http://www.e-ucm.es/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * This project has received funding from the European Union’s Horizon
 * 2020 research and innovation programme under grant agreement No 644187.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0 (link is external)
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var request = require('supertest'),
    db = require('../lib/db'),
    app = require('../app');

var config;

describe('API Test', function (done) {
    this.timeout(20000);
    /**Initialize MongoDB**/
    before(function (done) {

        config = app.config;
        app.listen(config.port, function (err) {
            if (err) {
                done(err);
            } else {
                request = request(app);
                // Give it 200ms so that the connection with MongoDB is established.
                setTimeout(function () {
                    done();
                }, 2000);
            }
        });
    });

    it('Start tests', function (done) {
        require('./tests/configs');
        require('./tests/tracesConverterTest');

        require('./tests/health')(request);
        require('./tests/gamesTest')(request, db);
        require('./tests/versionsTest')(request, db);
        require('./tests/classesTest')(request, db);
        require('./tests/activitiesTest')(request, db);
        require('./tests/analysisTest')(request, db);

        // Test collector and track, also drop the database.
        require('./tests/collectorTest')(request, db, config);
        require('./upgraderTests/mongo/mongoController')(request, app, db);
        require('./upgraderTests/mongo/mongoTransformerTo2')(app, db, config);
        require('./upgraderTests/mongo/mongoTransformerTo3')(app, db, config);
        // Test transformers
        if (process.env.TEST_ES) {
            require('./upgraderTests/elastic/elasticController')(app, app.esClient, db);
            require('./upgraderTests/elastic/elasticTransformerTo2')(app, app.esClient, db);
        }

        require('./upgraderTests/processController')(request, app, db);
        done();
    });

});

