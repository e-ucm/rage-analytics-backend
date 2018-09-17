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

var idGrouping;
var idGroup1 = ObjectID.createFromTime(2);
var idGroup2 = ObjectID.createFromTime(7);
var idClass = ObjectID.createFromTime(4);

module.exports = function (request, db) {

    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    /**                   Test Groupings  API                       **/
    /**-------------------------------------------------------------**/
    /**-------------------------------------------------------------**/
    describe('Groupings tests', function () {

        before(function (done) {
            db.collection('classes').insert(
                {
                    _id: idClass,
                    name: 'name',
                    participants: {
                        students: [],
                        assistants: [],
                        teachers: []
                    }
                }, db.collection('groups').insert(
                    {
                        name: 'groupName',
                        classId: idClass,
                        participants: {
                            _id: idGroup1,
                            teachers: ['t1'],
                            assistants: ['a1'],
                            students: ['s1']
                        }
                    }, db.collection('groups').insert(
                        {
                            name: 'groupName2',
                            classId: idClass,
                            participants: {
                                _id: idGroup2,
                                teachers: ['t2'],
                                assistants: ['a2'],
                                students: ['s2']
                            }
                        }, db.collection('groupings').insert(
                            {
                                name: 'groupingNameInit',
                                classId: idClass,
                                teachers: ['t2'],
                                groups: [idGroup1]
                            }, function() {
                                setTimeout(function() { done(); }, 500);
                            }))));
        });

        after(function (done) {
            db.collection('classes').drop(db.collection('groups').drop(db.collection('groupings').drop(done)));
        });

        it('should POST a new grouping', function (done) {
            request.post('/api/classes/' + idClass + '/groupings')
                .expect(200)
                .set('Accept', 'application/json')
                .set('X-Gleaner-User', 'teacher')
                .expect('Content-Type', /json/)
                .send({
                    name: 'groupingName',
                    groups: [idGroup1.toString(), idGroup2.toString()]
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res.body).be.Object();
                    should(res.body.groups).containDeep([idGroup1.toString(), idGroup2.toString()]);
                    should.equal(res.body.name, 'groupingName');
                    should.equal(res.body.classId, idClass);
                    idGrouping = res.body._id;
                    done();
                });
        });


        it('should GET groupings', function (done) {
            request.get('/api/classes/' + idClass + '/groupings')
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.length, 2);
                    (idGrouping).should.be.oneOf(res.body[0]._id, res.body[1]._id);
                    done();
                });
        });

        it('should GET a grouping', function (done) {
            request.get('/api/classes/groupings/' + idGrouping.toString())
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body._id, idGrouping);
                    should.equal(res.body.classId, idClass);
                    should(res.body.groups).containDeep([idGroup1.toString(), idGroup2.toString()]);
                    should.equal(res.body.name, 'groupingName');
                    done();
                });
        });

        it('should PUT (add) a grouping', function (done) {
            request.put('/api/classes/groupings/' + idGrouping)
                .expect(401)
                .set('X-Gleaner-User', 'notAllowedUsername')
                .send({
                    name: 'groupingNewName',
                    teachers: ['t2'],
                    groups: [ ObjectID.createFromTime(24)]
                })
                .end(function (err, res) {
                    should(res).be.Object();
                    request.put('/api/classes/groupings/' + idGrouping)
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .send({
                            name: 'groupingNewName',
                            teachers: ['t2'],
                            groups: [ ObjectID.createFromTime(24)]
                        })
                        .end(function (err, res) {
                            should.not.exist(err);
                            should(res).be.Object();
                            should.equal(res.body.name, 'groupingNewName');
                            should(res.body.teachers).containDeep(['t2']);
                            should.equal(res.body.groups.length, 3);
                            done();
                        });
                });
        });

        it('should PUT (add) a grouping', function (done) {
            request.put('/api/classes/groupings/' + idGrouping)
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .send({
                    teachers: ['t3']
                })
                .end(function (err, res) {
                    should.not.exist(err);
                    should(res).be.Object();
                    should.equal(res.body.name, 'groupingNewName');
                    should(res.body.teachers).containDeep(['t3']);
                    done();
                });
        });

        it('should DELETE a course', function (done) {
            request.delete('/api/classes/groupings/' + idGrouping)
                .expect(200)
                .set('X-Gleaner-User', 'teacher')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    should.not.exist(err);
                    request.get('/api/classes/' + idClass + '/groupings')
                        .expect(200)
                        .set('X-Gleaner-User', 'teacher')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            should.not.exist(err);
                            should.equal(res.body.length, 1);
                            (res.body[0]._id).should.not.equal(idGrouping);
                            done();
                        });
                });
        });

    });
};
