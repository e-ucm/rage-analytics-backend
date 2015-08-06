'use strict';

exports.port = process.env.PORT || '{{port}}';
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || '{{mongodbUrl}}'
};
exports.apiPath = '{{apiPath}}';
exports.companyName = '{{companyName}}';
exports.projectName = '{{projectName}}';
exports.lrs = {
  uri: process.env.LRS_URI || process.env.LRS_URL || '{{lrsUrl}}',
  username: '{{lrsUsername}}',
  password: '{{lrsPassword}}'
};