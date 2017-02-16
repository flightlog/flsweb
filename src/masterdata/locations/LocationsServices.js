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

export class Locations {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/:dest/:id', null, {
            getLocations: {
                method: 'GET',
                isArray: true,
                params: {
                    dest: 'locations',
                    id: ''
                }
            },
            getLocationTypes: {
                method: 'GET',
                isArray: true,
                params: {
                    dest: 'locationtypes',
                    id: 'listitems'
                }
            },
            getLengthUnitTypes: {
                method: 'GET',
                isArray: true,
                params: {
                    dest: 'lengthunittypes',
                    id: 'listitems'
                }
            },
            getElevationUnitTypes: {
                method: 'GET',
                isArray: true,
                params: {
                    dest: 'elevationunittypes',
                    id: 'listitems'
                }
            },
            getLocationDetails: {
                method: 'GET',
                isArray: false,
                params: {
                    dest: 'locations'
                }
            }
        });
    }
}

export class LocationPersister {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/locations/:id', null, {
            saveLocation: {
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
