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
                cache: false
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
                cache: false,
                params: {
                    dest: 'gliders'
                }
            },
            getTowingPlanes: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'towingaircrafts'
                }
            },
            getMotorPlanes: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'motoraircrafts'
                }
            }
        });
    }
}


export class Aircraft {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircrafts/:id', null, {
            get: {
                method: 'GET',
                isArray: false
            },
            saveAircraft: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
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

export class AircraftService {
    constructor($q, Aircraft) {
        return {
            delete: function (aircraft, aircrafts) {
                var deferred = $q.defer();
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