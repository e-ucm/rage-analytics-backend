'use strict';

var traces = [
    {
        id: 1000,
        type: 'traces',
        source: {
            name: 'name',
            timestamp: '2017-01-26T16:01:13.225Z',
            event: 'event',
            target: 'target',
            type: 'type',
            extension1: 'extension1Value'
        }
    },
    {
        id: 2000,
        type: 'traces',
        source: {
            name: 'name',
            timestamp: '2017-01-26T16:01:13.225Z',
            event: 'event',
            target: 'target',
            type: 'type',
            extension1: 'extension1Value',
            extension2: '1',
            extension3: 'true',
            extension4: 'elem1, elem2, elem3',
            extension5: 'value'
        }
    },
    {
        id: 3000,
        type: 'traces',
        source: {
            name: 'name',
            timestamp: '2017-01-26T16:01:13.225Z',
            event: 'event',
            target: 'target',
            type: 'type',
            extension1: 'null'
        }
    },
    {
        id: 4000,
        type: 'traces',
        source: {
            name: 'name',
            timestamp: '2017-01-26T16:01:13.225Z',
            event: 'event',
            target: 'target',
            type: 'type',
            ext: '2'
        }
    }
];

module.exports = traces;


