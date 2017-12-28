import moment from "moment";
import * as _ from "lodash";

export default class AircraftsEditController {
    constructor($scope, $q, $routeParams, $location, NgTableParams, $window, GLOBALS, AuthService, PagedAircrafts, AircraftService,
                Aircraft, AircraftTypes, CounterUnitTypes, Clubs, Persons, MessageManager, DropdownItemsRenderService, Locations) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = false;
        $scope.isClubAdmin = AuthService.isClubAdmin();
        $scope.md = {};

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

        $scope.cancel = function () {
            $location.path('/masterdata/aircrafts');
        };
        $scope.save = function (aircraft) {
            $scope.busy = true;
            aircraft.YearOfManufacture = moment($scope.times.manufacturingYear + "-01-01T00:00:00+0000");
            let p = new Aircraft(aircraft);
            if (aircraft.AircraftId) {
                p.$saveAircraft({id: aircraft.AircraftId})
                    .then(p.invalidate)
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'aircraft'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then(p.invalidate)
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'aircraft'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        if ($routeParams.id !== undefined) {
            $scope.busy = true;
            $q
                .all([
                    Clubs.query().$promise.then(clubs => $scope.md.clubs = clubs),
                    Persons.query().$promise.then(persons => $scope.md.persons = persons),
                    Locations.getLocations().$promise.then(locations => $scope.md.locations = locations),
                    AircraftTypes.query().$promise.then(aircraftTypes => $scope.md.aircraftTypes = aircraftTypes),
                    CounterUnitTypes.query().$promise.then(counterUnitTypes => $scope.md.counterUnitTypes = counterUnitTypes)
                ])
                .then(loadAircraft)
                .then(aircraft => $scope.aircraft = aircraft)
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
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    Immatriculation: 'asc'
                },
                count: 100
            }, {
                counts: [],
                getData: (params) => {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    return PagedAircrafts.getAircrafts($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                        .then((result) => {
                            params.total(result.TotalRows);

                            return result.Items;
                        })
                        .finally(() => {
                            $scope.busy = false;
                        });
                }
            });
        }

        $scope.newAircraft = function () {
            $location.path('/masterdata/aircrafts/new');
        };

        $scope.editAircraft = function (aircraft) {
            $location.path('/masterdata/aircrafts/' + aircraft.AircraftId);
        };

        $scope.deleteAircraft = function (aircraft) {
            AircraftService.delete(aircraft)
                .then(() => {
                    $scope.tableParams.reload();
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
            $scope.selectedAircraftType = $scope.md.aircraftTypes
                .find(aircraftType => {
                    return ("" + aircraftType.AircraftTypeId) === ("" + $scope.aircraft.AircraftType);
                });
        }

    }
}
