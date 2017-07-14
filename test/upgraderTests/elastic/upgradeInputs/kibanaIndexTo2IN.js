'use strict';

var traces = [
    {
        id: 'vis_id1000',
        type: 'visualization',
        source: {
            title: 'visualization_title',
            visState: '{"title":"visualization_title","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel":"Activity Count"}},{"id":"2","type":"terms","schema":"segment","params":{"field":"extension.keyword","size":15,"order":"desc","orderBy":"1","customLabel":"extension test"}}],"listeners":{}}',
            uiStateJSON: '{}',
            description: '',
            version: 1,
            kibanaSavedObjectMeta: {
                searchSourceJSON: '{"index":"index_id","query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
            },
            author: '_default_',
            isTeacher: false,
            isDeveloper: true
        }
    },
    {
        id: 'vis_id2000',
        type: 'visualization',
        source: {
            title: 'visualization_title',
            visState: '{"title":"visualization_title","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel":"Activity Count"}},{"id":"2","type":"terms","schema":"segment","params":{"field":"extension","size":1,"order":"desc","orderBy":"1","customLabel":"estension test"}}],"listeners":{}}',
            uiStateJSON: '{}',
            description: '',
            version: 1,
            kibanaSavedObjectMeta: {
                searchSourceJSON: '{"index":"index_id","query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
            },
            author: '_default_',
            isTeacher: false,
            isDeveloper: true
        }
    },
    {
        id: 'vis_id3000',
        type: 'visualization',
        source: {
            title: 'visualization_title',
            visState: '{"title":"visualization_title","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"scale":"linear","mode":"grouped","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{}},"aggs":[{"id":"2","type":"min","schema":"metric","params":{"field":"dt","customLabel":"Min Time"}},{"id":"1","type":"avg","schema":"metric","params":{"field":"extension.objectKey.subkey.keyword"}},{"id":"3","type":"max","schema":"metric","params":{"field":"event.keyword","customLabel":"Max Time"}},{"id":"4","type":"terms","schema":"split","params":{"field":"target.keyword","size":15,"order":"desc","orderBy":"_term","customLabel":"Times","row":false}}],"listeners":{}}',
            uiStateJSON: '{}',
            description: '',
            version: 1,
            kibanaSavedObjectMeta: {
                searchSourceJSON: '{"index":"index-id","query":{"query_string":{"analyze_wildcard":true,"query":"event:completed"}},"filter":[]}'
            },
            author: '_default_',
            isTeacher: true,
            isDeveloper: true
        }
    },
    {
        id: '25d43244e6f7-5601',
        type: 'server',
        source: {
            uuid: '440e7ffa-067e-4c20-a0bf-194bd39aee93'
        }
    },
    {
        id: 'dashboard_5888fb20924fa4006e96b10d',
        type: 'dashboard',
        source: {
            title: 'dashboard_5888fb20924fa4006e96b10d',
            hits: 0,
            description: '',
            panelsJSON: '[{"id":"AlternativeSelectedCorrectIncorrectPerQuestionId-Cmn_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":1,"size_x":6,"size_y":4,"col":1,"row":1.5},{"id":"AlternativeSelectedCorrectIncorrect_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":2,"size_x":6,"size_y":4,"col":2,"row":2.5},{"id":"TotalSessionPlayers-Cmn_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":3,"size_x":6,"size_y":4,"col":3,"row":3.5},{"id":"CompletablesAverageProgressOverTime_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":4,"size_x":6,"size_y":4,"col":4,"row":4.5},{"id":"VideosSeenSkipped-Cmn_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":5,"size_x":6,"size_y":4,"col":5,"row":5.5},{"id":"MaxCompletableScoresperPlayer_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":6,"size_x":6,"size_y":4,"col":6,"row":6.5},{"id":"AlternativeSelected-Question-CountPerTargetIDs_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":7,"size_x":6,"size_y":4,"col":7,"row":7.5},{"id":"CompletabeCompletedTimes-Cmn_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":8,"size_x":6,"size_y":4,"col":8,"row":8.5},{"id":"GamesStartedCompleted_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":9,"size_x":6,"size_y":4,"col":9,"row":9.5},{"id":"AllGameProgressperplayer-Maxprogress_5888fb20924fa4006e96b10d","type":"visualization","panelIndex":10,"size_x":6,"size_y":4,"col":10,"row":10.5}]',
            optionsJSON: '{"darkTheme":false}',
            uiStateJSON: '{"P-1":{"vis":{"legendOpen":false}},"P-2":{"vis":{"legendOpen":false}},"P-3":{"vis":{"legendOpen":false}},"P-4":{"vis":{"legendOpen":false}},"P-5":{"vis":{"legendOpen":false}},"P-6":{"vis":{"legendOpen":false}},"P-7":{"vis":{"legendOpen":false}},"P-8":{"vis":{"legendOpen":false}},"P-9":{"vis":{"legendOpen":false}},"P-10":{"vis":{"legendOpen":false}}}',
            version: 1,
            timeRestore: true,
            timeTo: 'now',
            timeFrom: 'now-1h',
            refreshInterval: {
                display: '5 seconds',
                pause: false,
                section: 1,
                value: 5000
            },
            kibanaSavedObjectMeta: {
                searchSourceJSON: '{"filter":[{"query":{"query_string":{"query":"*","analyze_wildcard":true}}}]}'
            }
        }
    },
    {
        id: 'index_id1000',
        type: 'index-pattern',
        source: {
            title: '58935a97e6806a006e3ae7bd',
            timeFieldName: 'timestamp',
            fields: '[{"name":"type","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},{"name":"gameplayId","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},{"name":"extension.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"type_hashCode","type":"number","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"dt","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},{"name":"checkExt","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},{"name":"score","type":"number","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"response.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"gameplay","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},{"name":"extension2.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"type.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"ayuda","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},{"name":"event_hashCode","type":"number","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"ayuda.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"mobile","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":true,"doc_values":false},{"name":"target.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true},{"name":"name.keyword","type":"string","count":0,"scripted":false,"indexed":true,"analyzed":false,"doc_values":true}]'
        }
    }




];

module.exports = traces;


