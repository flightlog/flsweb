export default class ClubEditController {
    constructor($scope, $q, $routeParams, $location, GLOBALS, MessageManager, Clubs, ClubService, ClubPersister,
                Countries, Locations, FlightTypes, StartTypes) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;

        function loadClub() {
            var deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return ClubPersister.get({id: $routeParams.id}).$promise;
        }

        if ($routeParams.id !== undefined) {
            $q.all([
                    Countries.query().$promise.then(function (result) {
                        $scope.countries = result;
                    }),
                    Locations.getLocations().$promise.then(function (result) {
                        $scope.locations = result;
                    }),
                    StartTypes.query().$promise.then(function (result) {
                        $scope.starttypes = result;
                    }),
                    FlightTypes.queryFlightTypesFor({dest: 'gliders'}).$promise.then(function (result) {
                        $scope.gliderFlightTypes = result;
                    }),
                    FlightTypes.queryFlightTypesFor({dest: 'towing'}).$promise.then(function (result) {
                        $scope.towingFlightTypes = result;
                    }),
                    FlightTypes.queryFlightTypesFor({dest: 'motor'}).$promise.then(function (result) {
                        $scope.motorFlightTypes = result;
                    }),
                    loadClub().then(function (club) {
                        $scope.club = club;
                    })
                ])
                .catch(_.partial(MessageManager.raiseError, 'load', 'club'))
                .finally(() => {
                    $scope.busy = false;
                });
        } else {
            Clubs.query().$promise
                .then((result) => {
                    $scope.clubs = result;
                })
                .finally(() => {
                    $scope.busy = false;
                });
        }

        $scope.cancel = function () {
            $location.path('/masterdata/clubs');
        };
        $scope.save = function (club) {
            $scope.busy = true;
            var p = new ClubPersister(club);
            if (club.ClubId) {
                p.$saveClub({id: club.ClubId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'club'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'club'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.newClub = function () {
            $location.path('/masterdata/clubs/new');
        };

        $scope.editClub = function (club) {
            $location.path('/masterdata/clubs/' + club.ClubId);
        };

        $scope.deleteClub = function (club) {
            ClubService.delete(club, $scope.clubs)
                .then(function (res) {
                    $scope.clubs = res;
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'club'));
        };

    }
}

