export class PagedAircrafts {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getAircrafts(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/aircrafts/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'aircrafts list'));
    }
}

export class AircraftsOverviews {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircrafts/overview', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: true
            }
        });
    }
}

export class Aircrafts {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircrafts/listitems/:dest', null, {
            getGliders: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'gliders'
                }
            },
            getTowingPlanes: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'towingaircrafts'
                }
            },
            getMotorPlanes: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'motoraircrafts'
                }
            }
        });
    }
}

function invalidate(GLOBALS, $cacheFactory, result) {
    let $httpDefaultCache = $cacheFactory.get('$http');

    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/aircrafts/overview');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/aircrafts/listitems/gliders');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/aircrafts/listitems/towingaircrafts');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/aircrafts/listitems/motoraircrafts');

    return Promise.resolve(result && result.data);
}

export class Aircraft {
    constructor($resource, GLOBALS, $cacheFactory) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircrafts/:id', null, {
            get: {
                method: 'GET',
                isArray: false,
                cache: false
            },
            saveAircraft: {
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
    }
}

export class AircraftService {
    constructor($q, Aircraft) {
        return {
            delete: function (aircraft, aircrafts) {
                let deferred = $q.defer();
                if (window.confirm('Do you really want to remove this aircraft from the database?')) {
                    Aircraft.delete({id: aircraft.AircraftId}).$promise
                        .then(function () {
                            aircrafts = _.filter(aircrafts, function (d) {
                                return d.AircraftId !== aircraft.AircraftId;
                            });
                            deferred.resolve(aircrafts);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(aircrafts);
                return deferred.promise;
            }
        };
    }
}