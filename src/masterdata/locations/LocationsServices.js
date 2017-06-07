import * as _ from "lodash";

export class PagedLocations {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getLocations(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/locations/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'locations list'));
    }
}

export class RoutesPerLocation {

    constructor(GLOBALS, $http, MessageManager) {
        this.GLOBALS = GLOBALS;
        this.$http = $http;
        this.MessageManager = MessageManager;
    }

    mapRoute(routeFromServer) {
        return {
            id: routeFromServer.InOutboundPointId,
            label: routeFromServer.InOutboundPointName
        }
    }

    getInboundRoutes(location) {
        return this.getRoutes(location, true)
    }

    getOutboundRoutes(location) {
        return this.getRoutes(location, false)
    }

    getRoutes(location, inbound) {
        if(!location || !location.LocationId) {
            return Promise.resolve([]);
        }

        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/inoutboundpoints/location/${location.LocationId}`)
            .then((response) => {
                let filtered = response.data
                    .filter((routeFromServer) => {
                        return routeFromServer.IsInboundPoint == inbound;
                    });

                return filtered.map(this.mapRoute);
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'routes for location ' + location.LocationId));
    }

    addInboundRoute(location, label) {
        return this.addRoute(location, label, true);
    }

    addOutboundRoute(location, label) {
        return this.addRoute(location, label, false);
    }

    addRoute(location, label, inbound) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/inoutboundpoints`, {
                IsInboundPoint: inbound,
                IsOutboundPoint: !inbound,
                LocationId: location.LocationId,
                InOutboundPointName: label
            })
            .then((response) => {
                return this.mapRoute(response.data);
            })
            .catch(_.partial(this.MessageManager.raiseError, 'add', 'route for location'));
    }

    removeRoute(route) {
        return this.$http
            .delete(`${this.GLOBALS.BASE_URL}/api/v1/inoutboundpoints/${route.id}`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'delete', 'route'));
    }
}

function invalidate(GLOBALS, $cacheFactory, result) {
    let $httpDefaultCache = $cacheFactory.get('$http');

    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/locations/');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/locationtypes/listitems');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/lengthunittypes/listitems');
    $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/elevationunittypes/listitems');

    return Promise.resolve(result && result.data);
}

export class Locations {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/:dest/:id', null, {
            getLocations: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'locations',
                    id: ''
                }
            },
            getLocationTypes: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'locationtypes',
                    id: 'listitems'
                }
            },
            getLengthUnitTypes: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'lengthunittypes',
                    id: 'listitems'
                }
            },
            getElevationUnitTypes: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    dest: 'elevationunittypes',
                    id: 'listitems'
                }
            },
            getLocationDetails: {
                method: 'GET',
                isArray: false,
                cache: true,
                params: {
                    dest: 'locations'
                }
            }
        });
    }
}

export class LocationPersister {
    constructor($resource, $cacheFactory, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/locations/:id', null, {
            saveLocation: {
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
    }
}

export class LocationService {
    constructor($q, $window, LocationPersister) {
        return {
            delete: function (location, locations) {
                var deferred = $q.defer();
                if ($window.confirm('Do you really want to remove this location from the database?')) {
                    LocationPersister.delete({id: location.LocationId}).$promise
                        .then(function () {
                            locations = _.filter(locations, function (d) {
                                return d.LocationId !== location.LocationId;
                            });
                            deferred.resolve(locations);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(locations);
                return deferred.promise;
            }
        };
    }
}
