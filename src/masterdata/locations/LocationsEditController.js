export default class LocationsEditController {
    constructor($scope, $q, $sce, $routeParams, $location, GLOBALS, AuthService, MessageManager, Locations,
                LocationService, LocationPersister, PagedLocations, Countries, DropdownItemsRenderService, NgTableParams) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();
        $scope.filter = {};
        $scope.sorting = {
            LocationName: 'asc'
        };

        $scope.positionChanged = function () {
            $scope.openAipUrl = $sce.trustAsResourceUrl('http://maps.openaip.net/?lat=' + $scope.location.Latitude + '&lon=' + $scope.location.Longitude);
        };

        $scope.renderLengthUnit = DropdownItemsRenderService.lengthUnitRenderer();
        $scope.renderElevetionUnit = DropdownItemsRenderService.renderElevetionUnit();

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
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    LocationName: 'asc'
                },
                count: 100
            }, {
                counts:[],
                getData: function(params) {
                    return PagedLocations.getLocations($scope.tableParams.filter(), $scope.tableParams.sorting())
                        .then((result) => {
                            params.total(result.length);

                            return result;
                        });
                }
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

        $scope.resetFilter = () => {
            $scope.filter = {};
        };
        $scope.toggleSorting = (attribute) => {
            console.log($scope.sorting);
            console.log(attribute);
            $scope.sorting[attribute] = $scope.sorting[attribute] === 'asc' ? 'desc' : 'asc';
        };
    }
}

