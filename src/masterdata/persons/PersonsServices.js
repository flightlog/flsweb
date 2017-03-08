export class PagedPersons {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getPersons(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/persons/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'persons list'));
    }

    getAllPersons() {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/persons`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'persons list'));
    }
}

export class PersonsV2 {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/persons/listitems/:clubonly', null, {
            getAllPersons: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    clubonly: true
                }
            }
        });
    }
}

export class Persons {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/persons/:dest/listitems/:clubonly', null, {
            getMotorPilots: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'motorpilots',
                    clubonly: true
                }
            },
            getMotorInstructors: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'motorinstructors',
                    clubonly: true
                }
            },
            getTowingPilots: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'towingpilots',
                    clubonly: true
                }
            },
            getGliderPilots: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'gliderpilots',
                    clubonly: true
                }
            },
            getGliderInstructors: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'gliderinstructors',
                    clubonly: true
                }
            },
            getGliderObservers: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'gliderobserverpilots',
                    clubonly: true
                }
            },
            getWinchOperators: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'winchoperators',
                    clubonly: true
                }
            },
            getPassengers: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'passengers',
                    clubonly: true
                }
            },
            getMyPerson: {
                method: 'GET',
                isArray: false,
                cache: false,
                params: {
                    dest: 'my'
                }
            }
        });
    }
}

export class PersonPersister {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/persons/:id', null, {
            savePerson: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
            },
            get: {
                method: 'GET'
            },
            delete: {
                method: 'POST',
                params: {
                    id: '@id'
                },
                headers: {
                    'X-HTTP-Method-Override': 'DELETE'
                }
            }
        });
    }
}

export class PassengerPersister {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/persons/passengers/:id', null, {
            savePerson: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
            },
            get: {
                method: 'GET'
            },
            delete: {
                method: 'POST',
                params: {
                    id: '@id'
                },
                headers: {
                    'X-HTTP-Method-Override': 'DELETE'
                }
            }
        });
    }
}

export class PersonService {
    constructor($q, PersonPersister) {
        return {
            delete: function (person, persons) {
                var deferred = $q.defer();
                if (window.confirm('Do you really want to remove this person from the database?')) {
                    PersonPersister.delete({id: person.PersonId}).$promise
                        .then(function () {
                            persons = _.filter(persons, function (d) {
                                return d.PersonId !== person.PersonId;
                            });
                            deferred.resolve(persons);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(persons);
                return deferred.promise;
            }
        };
    }
}

