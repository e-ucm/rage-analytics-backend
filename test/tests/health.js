'use strict';

var should = require('should'),
    ObjectID = require('mongodb').ObjectId;

var idGame = new ObjectID('dummyGameId0');

module.exports = function(request, db) {
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                      Test Health                            **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Health test', function () {
        beforeEach(function (done) {
            db.collection('games').insert(
                [{
                    title: 'Dummy2',
                    public: true
                },
                    {
                        _id: idGame,
                        title: 'Dummy',
                        author: 'Dummy'
                    }], done);
        });
        afterEach(function (done) {
            db.collection('games').drop(done);
        });
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