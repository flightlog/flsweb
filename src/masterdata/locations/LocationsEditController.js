export default class LocationsEditController {
    constructor($scope, $q, $sce, $routeParams, $location, GLOBALS, AuthService, MessageManager, Locations,
                LocationService, LocationPersister, PagedLocations, Countries, DropdownItemsRenderService, NgTableParams,
                RoutesPerLocation) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.md = {};

        $scope.isClubAdmin = AuthService.isClubAdmin();

        $scope.positionChanged = () => {
            let lat = this.extractNumber($scope.location.Latitude);
            let lon = this.extractNumber($scope.location.Longitude);

            $scope.openAipUrl = $sce.trustAsResourceUrl('//maps.openaip.net/?lat=' + lat + '&lon=' + lon);
        };

        $scope.renderLengthUnit = DropdownItemsRenderService.lengthUnitRenderer();
        $scope.renderElevetionUnit = DropdownItemsRenderService.renderElevetionUnit();

        function loadLocation() {
            let deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return LocationPersister.get({id: $routeParams.id}).$promise;
        }

        if ($routeParams.id !== undefined) {
            $q.all([
                Countries.query().$promise.then(function (result) {
                    $scope.md.countries = result;
                }),
                Locations.getLocationTypes().$promise.then(function (result) {
                    $scope.md.locationTypes = result;
                }),
                Locations.getLengthUnitTypes().$promise.then(function (result) {
                    $scope.md.lengthUnitTypes = result;
                }),
                Locations.getElevationUnitTypes().$promise.then(function (result) {
                    $scope.md.elevationUnitTypes = result;
                }),
                loadLocation().then(function (location) {
                    $scope.location = location;
                    $scope.routesBusy = true;
                    $q.all([
                        RoutesPerLocation.getRoutes(location, true)
                            .then((result) => {
                                $scope.inboundRoutes = result;
                            }),
                        RoutesPerLocation.getRoutes(location, false)
                            .then((result) => {
                                $scope.outboundRoutes = result;
                            })
                    ])
                        .finally(() => {
                            $scope.routesBusy = false;
                        });
                    $scope.positionChanged();
                })
            ])
                .catch(_.partial(MessageManager.raiseError, 'load', 'location'))
                .finally(function () {
                    $scope.busy = false;
                });
        } else {
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    LocationName: 'asc'
                },
                count: 100
            }, {
                counts: [],
                getData: function (params) {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    return PagedLocations.getLocations($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                        .then((result) => {
                            $scope.busy = false;
                            params.total(result.TotalRows);

                            return result.Items;
                        })
                        .finally(() => {
                            $scope.busy = false;
                        });
                }
            });
            Countries.query().$promise.then(function (result) {
                $scope.tableParams.countries = result;
            });
        }

        $scope.cancel = function () {
            $location.path('/masterdata/locations');
        };
        $scope.save = function (location) {
            $scope.busy = true;
            var p = new LocationPersister(location);
            if (location.LocationId) {
                p.$saveLocation({id: location.LocationId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'location'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'location'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.newLocation = function () {
            $location.path('/masterdata/locations/new');
        };

        $scope.editLocation = function (location) {
            $location.path('/masterdata/locations/' + location.LocationId);
        };

        $scope.deleteLocation = function (location) {
            LocationService.delete(location, $scope.locations)
                .then(function (res) {
                    $scope.locations = res;
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'location'));
        };

        $scope.toggleSorting = (attribute) => {
            $scope.sorting[attribute] = $scope.sorting[attribute] === 'asc' ? 'desc' : 'asc';
        };

        $scope.addInboundRoute = (label) => {
            $scope.routesBusy = true;
            RoutesPerLocation.addRoute($scope.location, label, true)
                .then((result) => {
                    $scope.inboundRoutes.push(result);
                })
                .finally(() => {
                    $scope.routesBusy = false;
                });
        };

        $scope.addOutboundRoute = (label) => {
            $scope.routesBusy = true;
            RoutesPerLocation.addRoute($scope.location, label, false)
                .then((result) => {
                    $scope.outboundRoutes.push(result);
                })
                .finally(() => {
                    $scope.routesBusy = false;
                });
        };

        $scope.removeInboundRoute = (route) => {
            $scope.routesBusy = true;
            RoutesPerLocation.removeRoute($scope.location, route)
                .then(() => {
                    $scope.inboundRoutes = $scope.inboundRoutes.filter((inboundRoute) => inboundRoute !== route);
                })
                .finally(() => {
                    $scope.routesBusy = false;
                });
        };

        $scope.removeOutboundRoute = (route) => {
            $scope.routesBusy = true;
            RoutesPerLocation.removeRoute($scope.location, route)
                .then(() => {
                    $scope.outboundRoutes = $scope.outboundRoutes.filter((inboundRoute) => inboundRoute !== route);
                })
                .finally(() => {
                    $scope.routesBusy = false;
                });
        };
    }

    extractNumber(str) {
        let matches = str && str.match(/(\d+(.\d.*))/);
        if (matches) {
            return matches[0];
        }

        return "";
    }
}

