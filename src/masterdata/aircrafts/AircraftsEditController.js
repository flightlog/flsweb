import moment from "moment";
import * as _ from "lodash";

export default class AircraftsEditController {
    constructor($scope, $q, $location, $routeParams, $window, GLOBALS, AuthService, AircraftsOverviews, AircraftService,
                Aircraft, AircraftTypes, CounterUnitTypes, Clubs, Persons, MessageManager, StringUtils, DropdownItemsRenderService) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();

        $scope.renderAircraftType = DropdownItemsRenderService.aircrafttypeRenderer();
        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderCounterUnitType = DropdownItemsRenderService.counterUnitTypeRenderer();

        function loadAircraft() {
            var deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return Aircraft.get({id: $routeParams.id}).$promise;
        }

        $scope.comparator = function (actual, expected) {
            if (!expected) {
                return true;
            }
            return StringUtils.contains(actual.Immatriculation, expected)
                || StringUtils.contains(actual.AircraftModel, expected)
                || StringUtils.contains(actual.CompetitionSign, expected)
                || StringUtils.contains(actual.ManufacturerName, expected);
        };

        $scope.cancel = function () {
            $location.path('/masterdata/aircrafts');
        };
        $scope.save = function (aircraft) {
            $scope.busy = true;
            aircraft.YearOfManufacture = moment($scope.times.manufacturingYear + "-01-01T00:00:00+0000");
            var p = new Aircraft(aircraft);
            if (aircraft.AircraftId) {
                p.$saveAircraft({id: aircraft.AircraftId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'aircraft'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'aircraft'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };


        if ($routeParams.id !== undefined) {
            let aircraftPromise = loadAircraft().then(aircraft => $scope.aircraft = aircraft);
            let clubsPromise = Clubs.query().$promise.then(clubs => $scope.clubs = clubs);
            let personsPromise = Persons.query().$promise.then(persons => $scope.persons = persons);
            let aircraftTypesPromise = AircraftTypes.query().$promise.then(aircraftTypes => $scope.aircraftTypes = aircraftTypes);
            let counterUnitTypesPromise = CounterUnitTypes.query().$promise.then(counterUnitTypes => $scope.counterUnitTypes = counterUnitTypes);

            $q.all([aircraftPromise, clubsPromise, personsPromise, aircraftTypesPromise, counterUnitTypesPromise])
                .then(() => {
                    $scope.times = {
                        manufacturingYear: moment($scope.aircraft.YearOfManufacture).format("YYYY")
                    };
                    $scope.ownerType = $scope.aircraft.AircraftOwnerClubId ? 'club' : 'private';
                    $scope.aircraftTypeChanged();
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'aircraft'))
                .finally(() => {
                    $scope.busy = false;
                });
        } else {
            AircraftsOverviews.query().$promise
                .then((result) => {
                    $scope.aircrafts = result;
                })
                .finally(() => {
                    $scope.busy = false;
                });
        }

        $scope.newAircraft = function () {
            $location.path('/masterdata/aircrafts/new');
        };

        $scope.editAircraft = function (aircraft) {
            $location.path('/masterdata/aircrafts/' + aircraft.AircraftId);
        };

        $scope.deleteAircraft = function (aircraft) {
            AircraftService.delete(aircraft, $scope.aircrafts)
                .then(function (res) {
                    $scope.aircrafts = res;
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'aircraft'));
        };

        $scope.ownerTypeChanged = () => {
            $scope.aircraft.AircraftOwnerClubId = undefined;
            $scope.aircraft.AircraftOwnerPersonId = undefined;
        };

        $scope.testLink = (link) => {
            $window.open(link);
        };

        $scope.aircraftTypeChanged = () => {
            $scope.selectedAircraftType = $scope.aircraftTypes
                .find(aircraftType => {
                    return ("" + aircraftType.AircraftTypeId) === ("" + $scope.aircraft.AircraftType);
                });
        }

    }
}
