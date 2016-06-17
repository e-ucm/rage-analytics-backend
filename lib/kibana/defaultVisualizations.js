'use strict';

var defaultVisualizations = [
    {
        title: 'alternatives',
        visState: '{"title":"alternatives","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,' +
            '"addLegend":true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,' +
            '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},' +
            '{"id":"2","type":"terms","schema":"segment","params":{"field":"target.keyword","size":15,"order":"desc",' +
            '"orderBy":"1"}},{"id":"3","type":"terms","schema":"group","params":{"field":"response.keyword","size":5,' +
            '"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"templateIndex","query":{"query_string":{"query":"event:preferred","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    }
];

module.exports = defaultVisualizations;