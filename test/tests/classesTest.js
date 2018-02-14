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
var idClass2 =  ObjectID.createFromTime(2);
var idClassWithNoParticipants =  ObjectID.createFromTime(3);
var idClassWithNoParticipantsButGroup =  ObjectID.createFromTime(4);
var idClassButEmptyGroup =  ObjectID.createFromTime(5);
var idClassWithNoParticipantsButGrouping =  ObjectID.createFromTime(6);
var idClassButEmptyGrouping =  ObjectID.createFromTime(7);
var idGroup =  ObjectID.createFromTime(8);
var idGroupWithNoParticipants =  ObjectID.createFromTime(9);
var idGrouping =  ObjectID.createFromTime(10);
var idGroupingWithNoParticipants =  ObjectID.createFromTime(11);
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
                    groups: [],
                    groupings: [],
                    participants: {
                        teachers: ['Teacher1'],
                        assistants: ['Assistant1'],
                        students: ['Student1']
                    }
                }, db.collection('classes').insert(
                    {
                        _id: idClass2,
                        courseId: courseId,
                        name: 'name2',
                        groups: [],
                        groupings: [],
                        participants: {
                            teachers: ['Teacher1'],
                            assistants: ['Assistant1'],
                            students: ['Student1']
                        }
                    },db.collection('classes').insert(
                        {
                            _id: idClassWithNoParticipants,
                            name: 'orphan class',
                            groups: [],
                            groupings: [],
                            participants: {
                                teachers: [],
                                assistants: [],
                                students: []
                            }
                        },db.collection('classes').insert(
                            {
                                _id: idClassWithNoParticipantsButGroup,
                                courseId: courseId,
                                groups: [idGroup],
                                groupings: [],
                                name: 'group class',
                                participants: {
                                    teachers: [],
                                    assistants: [],
                                    students: []
                                }
                            },db.collection('classes').insert(
                                {
                                    _id: idClassButEmptyGroup,
                                    courseId: courseId,
                                    groups: [idGroupWithNoParticipants],
                                    groupings: [],
                                    name: 'with empty group',
                                    participants: {
                                        teachers: ['Teacher1'],
                                        assistants: ['Assistant1'],
                                        students: ['Student1']
                                    }
                                },db.collection('classes').insert(
                                    {
                                        _id: idClassWithNoParticipantsButGrouping,
                                        courseId: courseId,
                                        groups: [],
                                        groupings: [idGrouping],
                                        name: 'with empty group',
                                        participants: {
                                            teachers: [],
                                            assistants: [],
                                            students: []
                                        }
                                    },db.collection('classes').insert(
                                        {
                                            _id: idClassButEmptyGrouping,
                                            courseId: courseId,
                                            groups: [],
                                            groupings: [idGroupingWithNoParticipants],
                                            name: 'with empty group',
                                            participants: {
                                                teachers: ['Teacher1'],
                                                assistants: ['Assistant1'],
                                                students: ['Student1']
                                            }
                                        }, db.collection('groups').insert(
                                            {
                                                _id: idGroup,
                                                participants: {
                                                    teachers: ['Teacher1'],
                                                    assistants: ['Assistant1'],
                                                    students: ['Student1']
                                                }
                                            }, db.collection('groups').insert(
                                                {
                                                    _id: idGroupWithNoParticipants,
                                                    participants: {
                                                        teachers: [],
                                                        assistants: [],
                                                        students: []
                                                    }
                                                }, db.collection('groupings').insert(
                                                    {
                                                        _id: idGrouping,
                                                        courseId: courseId,
                                                        teachers: ['Teacher1'],
                                                        groups: [ idGroup, idGroupWithNoParticipants ]
                                                    }, db.collection('groupings').insert(
                                                        {
                                                            _id: idGroupingWithNoParticipants,
                                                            courseId: courseId,
                                                            teachers: ['Teacher1'],
                                                            groups: []
                                                        }, db.collection('courses').insert(
                                                            {
                                                                _id: courseId,
                                                                title: 'course',
                                                                teachers: ['Teacher1']
                                                            }, function() {
                                                                setTimeout(function() { done(); }, 500);
                                                            })
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        });

        afterEach(function (done) {
            db.collection('classes')
                .drop(db.collection('courses')
                    .drop(db.collection('groups')
                        .drop(db.collection('groupings')
                            .drop(done))));
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
                    should.equal(res.body.length, 7);
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
                    should.equal(res.body.length, 4);
                    should.equal(res.body[0]._id, idClass);
                    done();
                });
        });

        it('should GET a class', function (done) {
            request.get('/api/classes/' + idClass)
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
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
                    request.put('/api/classes/' + idClass)
                        .expect(401)
                        .set('X-Gleaner-User', 'Student1')
                        .send({
                            name: 'newName'
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
                                    should.equal(res.body.courseId, courseId);
                                    done();
                                });
                        });
                });
        });

        it('should PUT (add) a class', function (done) {
            request.put('/api/classes/' + idClass2)
                .expect(200)
                .set('X-Gleaner-User', 'Teacher1')
                .send({
                    courseId: ''
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.name, 'name2');
                    should(res.body.participants.teachers).containDeep(['Teacher1']);
                    should(res.body.participants.students).containDeep(['Student1']);
                    should.not.exist(res.body.courseId);
                    done();
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
