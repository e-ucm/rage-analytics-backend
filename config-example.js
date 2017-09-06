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

exports.port = process.env.PORT || '{{port}}';
exports.myHost = '{{myHost}}';
exports.mongodb = {
    uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || '{{mongodbUrl}}',
    modelVersion: '{{mongoModelVersion}}',
    uriA2: '{{mongodbUrlA2}}'
};
exports.elasticsearch = {
    uri: process.env.ELASTIC_HOST || '{{elasticsearchURL}}',
    modelVersion: '{{elasticsearchModelVersion}}'
};
exports.apiPath = '{{apiPath}}';
exports.companyName = '{{companyName}}';
exports.projectName = '{{projectName}}';
exports.lrs = {
    uri: process.env.LRS_URI || process.env.LRS_URL || '{{lrsUrl}}',
    username: '{{lrsUsername}}',
    password: '{{lrsPassword}}'
};
exports.storm = {
    realtimeJar: '{{realtimeJar}}',
    path: '{{stormPath}}',
    nimbusHost: '{{nimbusHost}}',
    fluxYaml: '{{fluxYaml}}',
    analysisFolder: '{{analysisFolder}}',
    elasticsearchHost: '{{elasticsearchHost}}',
    elasticsearchPort: '{{elasticsearchPort}}'
};
exports.maxSizeRequest = '{{maxSizeRequest}}';

exports.kafka = {
    uri: process.env.KAFKA_URI || process.env.KAFKA_URL || '{{kafkaUrl}}'
};
exports.a2 = {
    a2ApiPath: '{{a2ApiPath}}',
    a2Prefix: '{{a2Prefix}}',
    a2HomePage: '{{a2HomePage}}',
    a2AdminUsername: '{{a2AdminUsername}}',
    a2AdminPassword: '{{a2AdminPassword}}'
};
exports.kibana = {
    defaultIndex: '{{defaultKibanaIndex}}'
};