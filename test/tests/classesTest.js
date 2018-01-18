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

var should = require('should'),
    ObjectID = require('mongodb').ObjectId;

var idClass = new ObjectID('dummyClasId9');
var courseId =  ObjectID.createFromTime(15);

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Classes  API                         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Classes tests', function () {

        beforeEach(function (done) {
            db.collection('classes').insert(
            {
                _id: idClass,
                name: 'name',
                participants: {
                    teachers: ['Teacher1'],
                    students: ['Student1']
                }
            }, db.collection('courses').insert(
                    {
                        _id: courseId,
                        title: 'course',
                        teachers: ['teacher']
                    }, function() {
                        setTimeout(function() { done(); }, 500);
                    }));
        });

        afterEach(function (done) {
            db.collection('classes').drop(db.collection('courses').drop(done));
        });

        it('should POST a new class', function (done) {
            request.post('/api/classes')
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'username')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body.participants.teachers[0], 'username');
                    should(res.body.created).be.String();
                    done();
                });
        });

        it('should GET classes', function (done) {
            request.get('/api/classes')
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 1);
                    should.equal(res.body[0]._id, idClass);
                    done();
                });
        });

        it('should GET my classes', function (done) {
            request.get('/api/classes/my')
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    console.log(res.body);
                    should.equal(res.body.length, 1);
                    should.equal(res.body[0]._id, idClass);
                    done();
                });
        });

        it('should GET a class', function (done) {
            request.get('/api/classes/' + idClass)
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body._id, idClass);
                    done();
                });
        });

        it('should PUT (add) a class', function (done) {
            request.put('/api/classes/' + idClass)
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .send({
                    name: 'someClassNameTest',
                    participants: {
                        teachers: ['Teacher1', 'Teacher2'],
                        students: ['Student2']
                    },
                    courseId: courseId
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.put('/api/classes/' + idClass)
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .send({
                            name: 'someClassNameTest',
                            participants: {
                                teachers: ['Teacher1', 'Teacher2'],
                                students: ['Student2']
                            },
                            courseId: courseId
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.name, 'someClassNameTest');
                            should(res.body.participants.teachers).containDeep(['Teacher1', 'Teacher2']);
                            should(res.body.participants.students).containDeep(['Student1', 'Student2']);
                            done();
                        });
                });
        });

        it('should not PUT (add) a class if the courseId doesn\'t exist', function (done) {
            request.put('/api/classes/' + idClass)
                .expect(400)
                .set('X-Gleaner-User', 'Teacher1')
                .send({
                    name: 'someClassNameTest',
                    participants: {
                        teachers: ['Teacher1', 'Teacher2'],
                        students: ['Student2']
                    },
                    courseId: 'course'
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    done();
                });
        });

        it('should PUT (remove) a class', function (done) {
            request.put('/api/classes/' + idClass + '/remove')
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .send({
                    participants: {
                        teachers: ['Teacher2'],
                        students: ['Student1']
                    }
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.put('/api/classes/' + idClass + '/remove')
                        .expect(200)
                        .set('X-Gleaner-User', 'Teacher1')
                        .send({
                            participants: {
                                teachers: ['Teacher2'],
                                students: ['Student1']
                            }
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.an.Object();
                            should(res.body.participants.students).not.containDeep(['Student1']);
                            should(res.body.participants.teachers).containDeep(['Teacher1']);
                            should.equal(res.body.participants.teachers.length, 1);
                            should.equal(res.body.participants.students.length, 0);
                            done();
                        });
                });
        });
    });
};
