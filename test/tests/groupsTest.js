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

var idGroup;
var idClass = ObjectID.createFromTime(4);
var idClass2 = ObjectID.createFromTime(6);

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Groups  API                          **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Groups tests', function () {

        before(function (done) {
            db.collection('classes').insert(
                {
                    _id: idClass,
                    name: 'name',
                    groups: [],
                    groupings: [],
                    participants: {
                        teachers: ['teacher'],
                        assistants: ['Assistant1'],
                        students: ['Student1']
                    }
                }, db.collection('groups').insert(
                    {
                        name: 'groupName',
                        classId: idClass,
                        participants: {
                            teachers: ['teacher'],
                            assistants: [],
                            students: []
                        }
                    }, db.collection('groups').insert(
                        {
                            name: 'groupName',
                            classId: idClass2,
                            participants: {
                                teachers: ['teacher'],
                                assistants: [],
                                students: []
                            }
                        }, function() {
                            setTimeout(function() { done(); }, 500);
                        })));
        });

        after(function (done) {
            db.collection('classes').drop(db.collection('groups').drop(done));
        });

        it('should POST a new group', function (done) {
            request.post('/api/classes/' + idClass + '/groups')
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'teacher')
                .expect('Content-Type', /json/)
                .send({
                    name: 'groupName',
                    participants: {
                        teachers: [],
                        assistants: [],
                        students: []
                    }
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should.equal(res.body.participants.teachers[0], 'teacher');
                    should.equal(res.body.name, 'groupName');
                    should.equal(res.body.classId, idClass);
                    idGroup = res.body._id;
                    done();
                });
        });

        it('should GET groups', function (done) {
            request.get('/api/classes/' + idClass + '/groups')
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 2);
                    (idGroup).should.be.oneOf(res.body[0]._id, res.body[1]._id);
                    done();
                });
        });

        it('should GET a group', function (done) {
            request.get('/api/classes/groups/' + idGroup.toString())
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body._id, idGroup);
                    done();
                });
        });


        it('should PUT (add) a group', function (done) {
            request.put('/api/classes/groups/' + idGroup)
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .send({
                    name: 'someGroupNameTest',
                    participants: {
                        students: ['st1'],
                        assistants: ['as1', 'as2']
                    }
                })
                .end(function (err, res) {
                    should(res).be.Object();
                    request.put('/api/classes/groups/' + idGroup)
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .send({
                            name: 'someGroupNameTest',
                            participants: {
                                students: ['st1'],
                                assistants: ['as1', 'as2']
                            }
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.name, 'someGroupNameTest');
                            should(res.body.participants.teachers).containDeep(['teacher']);
                            should(res.body.participants.students).containDeep(['st1']);
                            should(res.body.participants.assistants).containDeep(['as1', 'as2']);
                            done();
                        });
                });
        });


        it('should PUT (add) a group', function (done) {
            request.put('/api/classes/groups/' + idGroup)
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .send({
                    participants: {
                        teachers: ['tea1'],
                        assistants: ['as3', 'as4']
                    }
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.name, 'someGroupNameTest');
                    should(res.body.participants.teachers).containDeep(['tea1', 'teacher']);
                    should(res.body.participants.assistants).containDeep(['as3', 'as4']);
                    should(res.body.participants.students).containDeep(['st1']);
                    done();
                });
        });


        it('should PUT (remove) a course', function (done) {
            request.put('/api/classes/groups/' + idGroup + '/remove')
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .send({
                    participants: {
                        teachers: ['st1'],
                        assistants: ['as1', 'as2', 'as3', 'as4']
                    }
                })
                .end(function (err, res) {
                    should(res).be.Object();
                    request.put('/api/classes/groups/' + idGroup + '/remove')
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .send({
                            participants: {
                                teachers: ['st1'],
                                assistants: ['as1', 'as2', 'as3', 'as4']
                            }
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.an.Object();
                            should(res.body.participants.assistants).not.containDeep(['as1']);
                            should(res.body.participants.teachers).containDeep(['teacher']);
                            should.equal(res.body.participants.teachers.length, 2);
                            should.equal(res.body.participants.assistants.length, 0);
                            done();
                        });
                });
        });

        it('should DELETE a course', function (done) {
            request.delete('/api/classes/groups/' + idGroup)
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    request.get('/api/classes/' + idClass + '/groups')
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should.equal(res.body.length, 1);
                            (res.body[0].classId).should.not.equal(idClass);
                            done();
                        });
                });
        });
    });
};
