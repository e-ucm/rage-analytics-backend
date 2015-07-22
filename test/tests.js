'use strict';

var should = require('should');
var app = {
    config: require('../config-test'),
    get: function (str) {
        return str;
    }
};


describe('Some tests', function () {
    this.timeout(4000);

    before(function (done) {
        done();
    });

    after(function () {

    });

    it('1', function (done) {
        should(done).be.a.Function();
        should(app).be.an.Object();
        done();
    });
});