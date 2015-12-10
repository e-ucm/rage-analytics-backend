'use strict';

var should = require('should');

module.exports = function(request) {
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                      Test Health                            **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Health test', function () {
        it('should return status 200', function (done) {
            request.get('/api/health')
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    done();
                });
        });
    });
};