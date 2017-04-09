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
                cache: true,
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
                cache: true,
                params: {
                    dest: 'motorpilots',
                    clubonly: true
                }
            },
            getMotorInstructors: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'motorinstructors',
                    clubonly: true
                }
            },
            getTowingPilots: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'towingpilots',
                    clubonly: true
                }
            },
            getGliderPilots: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'gliderpilots',
                    clubonly: true
                }
            },
            getGliderInstructors: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'gliderinstructors',
                    clubonly: true
                }
            },
            getGliderObservers: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'gliderobserverpilots',
                    clubonly: true
                }
            },
            getWinchOperators: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'winchoperators',
                    clubonly: true
                }
            },
            getPassengers: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'passengers',
                    clubonly: true
                }
            },
            getMyPerson: {
                method: 'GET',
                isArray: false,
                cache: true,
                params: {
                    dest: 'my'
                }
            }
        });
    }
}

function invalidate(GLOBALS, $cacheFactory, result) {
    let $httpDefaultCache = $cacheFactory.get('$http');

    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/motorpilots/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/motorinstructors/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/towingpilots/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/gliderpilots/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/gliderinstructors/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/gliderobserverpilots/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/winchoperators/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/passengers/listitems/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/passengers/true');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/persons/passengers/my/');

    return Promise.resolve(result && result.data);
}

export class PersonPersister {
    constructor($resource, GLOBALS, $cacheFactory) {
        let personResource = $resource(GLOBALS.BASE_URL + '/api/v1/persons/:id', null, {
            savePerson: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                },
                interceptor: {
                    response: () => invalidate(GLOBALS, $cacheFactory)
                }
            },
            save: {
                method: 'POST',
                interceptor: {
                    response: (result) => invalidate(GLOBALS, $cacheFactory, result)
                }
            },
            get: {
                method: 'GET',
                cache: false
            },
            delete: {
                method: 'POST',
                params: {
                    id: '@id'
                },
                headers: {
                    'X-HTTP-Method-Override': 'DELETE'
                },
                interceptor: {
                    response: () => invalidate(GLOBALS, $cacheFactory)
                }
            }
        });
        personResource.invalidate = () => invalidate(GLOBALS, $cacheFactory);

        return personResource;
    }
}

export class PassengerPersister {
    constructor($resource, GLOBALS, $cacheFactory) {
        let passengerResource = $resource(GLOBALS.BASE_URL + '/api/v1/persons/passengers/:id', null, {
            savePerson: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                },
                interceptor: {
                    response: () => invalidate(GLOBALS, $cacheFactory)
                }
            },
            $save: {
                method: 'POST',
                interceptor: {
                    response: (result) => invalidate(GLOBALS, $cacheFactory, result)
                }
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
                },
                interceptor: {
                    response: () => invalidate(GLOBALS, $cacheFactory)
                }
            }
        });
        passengerResource.invalidate = () => invalidate(GLOBALS, $cacheFactory);

        return passengerResource;
    }
}

export class PersonService {
    constructor($q, PersonPersister) {
        return {
            delete: function (person, persons) {
                let deferred = $q.defer();
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

