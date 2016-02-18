export class FlightTypes {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/flighttypes/:dest', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'overview'
                }
            },
            queryFlightTypesFor: {
                method: 'GET',
                isArray: true,
                cache: false
            }
        });
    }
}


export class FlightType {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/flighttypes/:id', null, {
            get: {
                method: 'GET',
                isArray: false
            },
            saveFlightType: {
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

export class FlightTypeService {
    constructor($q, FlightType) {
        return {
            delete: function (flightType, flightTypes) {
                var deferred = $q.defer();
                if (window.confirm('Do you really want to remove this flight type from the database?')) {
                    FlightType.delete({id: flightType.FlightTypeId}).$promise
                        .then(function () {
                            flightTypes = _.filter(flightTypes, function (d) {
                                return d.FlightTypeId !== flightType.FlightTypeId;
                            });
                            deferred.resolve(flightTypes);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(flightTypes);
                return deferred.promise;
            }
        };
    }
}