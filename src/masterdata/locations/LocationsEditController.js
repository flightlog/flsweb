export default class LocationsEditController {
    constructor($scope, $q, $sce, $routeParams, $location, GLOBALS, AuthService, MessageManager, Locations, LocationService, LocationPersister, Countries) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();

        $scope.positionChanged = function () {
            $scope.openAipUrl = $sce.trustAsResourceUrl('http://maps.openaip.net/?lat=' + $scope.location.Latitude + '&lon=' + $scope.location.Longitude);
        };

        function loadLocation() {
            var deferred = $q.defer();
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
                        $scope.countries = result;
                    }),
                    Locations.getLocationTypes().$promise.then(function (result) {
                        $scope.locationTypes = result;
                    }),
                    Locations.getLengthUnitTypes().$promise.then(function (result) {
                        $scope.lengthUnitTypes = result;
                    }),
                    Locations.getElevationUnitTypes().$promise.then(function (result) {
                        $scope.elevationUnitTypes = result;
                    }),
                    loadLocation().then(function (location) {
                        $scope.location = location;
                        $scope.positionChanged();
                    })
                ])
                .catch(_.partial(MessageManager.raiseError, 'load', 'location'))
                .finally(function () {
                    $scope.busy = false;
                });
        } else {
            Locations.getLocations().$promise
                .then((result) => {
                    $scope.locations = result;
                })
                .finally(() => {
                    $scope.busy = false;
                })
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

    }
}

