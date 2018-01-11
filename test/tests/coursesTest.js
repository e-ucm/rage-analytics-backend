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

var idCourse;
var idClass = ObjectID.createFromTime(2);

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Courses  API                         **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Courses tests', function () {

        after(function (done) {
            db.collection('classes').drop(db.collection('courses').drop(done));
        });

        it('should POST a new course', function (done) {
            request.post('/api/courses')
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'teacher')
                .expect('Content-Type', /json/)
                .send({
                    title: 'courseTest',
                    teachers: [],
                    assistants: []
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body.teachers[0], 'teacher');
                    idCourse = res.body._id;
                    db.collection('classes').insert(
                        {
                            _id: idClass,
                            name: 'name',
                            courseId: idCourse,
                            participants: {
                                students: [],
                                assistants: [],
                                teachers: []
                            }
                        }, done);
                    done();
                });
        });

        it('should GET courses', function (done) {
            request.get('/api/courses')
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 1);
                    should.equal(res.body[0]._id, idCourse);
                    done();
                });
        });

        it('should GET a course', function (done) {
            request.get('/api/courses/' + idCourse.toString())
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body._id, idCourse);
                    done();
                });
        });

        it('should PUT (add) a course', function (done) {
            request.put('/api/courses/' + idCourse)
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .send({
                    title: 'someCourseNameTest',
                    teachers: ['st1'],
                    assistants: ['as1', 'as2']
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.put('/api/courses/' + idCourse)
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .send({
                            title: 'someCourseNameTest',
                            teachers: ['st1'],
                            assistants: ['as1', 'as2']
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.title, 'someCourseNameTest');
                            should(res.body.teachers).containDeep(['st1', 'teacher']);
                            should(res.body.assistants).containDeep(['as1', 'as2']);
                            done();
                        });
                });
        });

        it('should PUT (add) a course', function (done) {
            request.put('/api/courses/' + idCourse)
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .send({
                    teachers: ['st2'],
                    assistants: ['as3', 'as4']
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.title, 'someCourseNameTest');
                    should(res.body.teachers).containDeep(['st2', 'teacher']);
                    should(res.body.assistants).containDeep(['as3', 'as4']);
                    done();
                });
        });

        it('should PUT (remove) a course', function (done) {
            request.put('/api/courses/' + idCourse + '/remove')
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .send({
                    teachers: ['st1'],
                    assistants: ['as1', 'as2', 'as3', 'as4']
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    request.put('/api/courses/' + idCourse + '/remove')
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .send({
                            teachers: ['st1'],
                            assistants: ['as1', 'as2', 'as3', 'as4']
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.an.Object();
                            should(res.body.assistants).not.containDeep(['as1']);
                            should(res.body.teachers).containDeep(['teacher']);
                            should.equal(res.body.teachers.length, 2);
                            should.equal(res.body.assistants.length, 0);
                            done();
                        });
                });
        });

        it('should DELETE a course', function (done) {
            request.delete('/api/courses/' + idCourse)
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    request.get('/api/courses')
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should.equal(res.body.length, 0);
                            request.get('/api/classes/'+idClass)
                                .expect(200)
                                .set('X-Gleaner-User', 'teacher')
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .end(function (err, res) {
                                    should.not.exist(err);
                                    should.equal(res.body.name, 'name');
                                    should.equal(res.body.courseId, undefined);
                                    done();
                                });
                        });
                });
        });
    });
};
