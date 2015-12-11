'use strict';

var should = require('should'),
    ObjectID = require('mongodb').ObjectId;

var idGame = new ObjectID('dummyGameId0');

module.exports = function(request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                     Test Games API                          **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Games tests', function () {
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

        it('should POST games', function (done) {
            request.post('/api/games')
                .expect(200)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    done();
                });
        });

        it('should GET games', function (done) {
            request.get('/api/games')
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.equal(res.body.length, 2);
                    done();
                });
        });

        it('should UPDATE a specific game', function (done) {
            request.post('/api/games/' + idGame)
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .send({
                    title: 'title2',
                    public: true
                }).end(function (err, res) {
                    should.not.exist(err);
                    should.equal(res.body._id, idGame);
                    should.equal(res.body.title, 'title2');
                    should.equal(res.body.public, true);
                    done();
                });
        });

        it('should GET a public game', function (done) {
            request.get('/api/games/public')
                .expect(200)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.equal(res.body.length, 1);
                    done();
                });
        });

        it('should GET my games', function (done) {
            request.get('/api/games/my')
                .expect(200)
                .set('X-Gleaner-User', 'Dummy')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.equal(res.body.length, 1);
                    done();
                });
        });
    });
};
