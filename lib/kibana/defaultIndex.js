'use strict';

var defaultIndex = {
    title: 'defaultIndex',
    timeFieldName: 'timestamp',
    fields: '[' +
    '{"name":"_index","type":"string","count":0,"scripted":false,"indexed":false,"analyzed":false,"doc_values":false},' +
    '{"name":"value.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"gameplayId","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},' +
    '{"name":"response.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"gameplayId.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"event","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},' +
    '{"name":"value","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},' +
    '{"name":"versionId.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"timestamp","type":"date","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"event.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"target.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"time_value","type":"number","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"target","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},' +
    '{"name":"versionId","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},' +
    '{"name":"response","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},' +
    '{"name":"score_value","type":"number","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"stored","type":"date","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},' +
    '{"name":"_source","type":"_source","count":0,"scripted":false,"indexed":false,"analyzed":false,"doc_values":false},' +
    '{"name":"_id","type":"string","count":0,"scripted":false,"indexed":false,"analyzed":false,"doc_values":false},' +
    '{"name":"_type","type":"string","count":0,"scripted":false,"indexed":false,"analyzed":false,"doc_values":false},' +
    '{"name":"_score","type":"number","count":0,"scripted":false,"indexed":false,"analyzed":false,"doc_values":false}]'
};

module.exports = defaultIndex;