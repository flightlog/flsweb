export class FlightTypes {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/flighttypes/:dest', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'overview'
                }
            },
            queryFlightTypesFor: {
                method: 'GET',
                isArray: true,
                cache: true
            }
        });
    }
}

function invalidate(GLOBALS, $cacheFactory, result) {
    let $httpDefaultCache = $cacheFactory.get('$http');

    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/flighttypes/overview');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/flighttypes/gliders');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/flighttypes/towing');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/flighttypes/motor');

    return Promise.resolve(result && result.data);
}

export class FlightType {
    constructor($resource, $cacheFactory, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/flighttypes/:id', null, {
            get: {
                method: 'GET',
                isArray: false,
                cache: false
            },
            saveFlightType: {
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