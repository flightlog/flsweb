import moment from "moment/moment";

export default class AddAircraftController {
    constructor(GLOBALS, $q, $scope, $modalInstance, aircraftTypeIds, Clubs, Persons, Locations, AircraftTypes, CounterUnitTypes, DropdownItemsRenderService) {
        $scope.debug = GLOBALS.DEBUG;

        $scope.md = {};
        $scope.times = {};
        
        $q.all([
            Clubs.query().$promise.then(clubs => $scope.md.clubs = clubs),
            Persons.query().$promise.then(persons => $scope.md.persons = persons),
            Locations.getLocations().$promise.then(locations => $scope.md.locations = locations),
            AircraftTypes.query().$promise.then(aircraftTypes => $scope.md.aircraftTypes = aircraftTypes.filter(t => aircraftTypeIds.indexOf(t.AircraftTypeId) > -1)),
            CounterUnitTypes.query().$promise.then(counterUnitTypes => $scope.md.counterUnitTypes = counterUnitTypes)
        ]);

        $scope.renderAircraftType = DropdownItemsRenderService.aircrafttypeRenderer();
        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderCounterUnitType = DropdownItemsRenderService.counterUnitTypeRenderer();

        $scope.aircraft = {
            CanUpdateRecord: true,
            AircraftType: aircraftTypeIds[0]
        };

        $scope.ok = function (aircraft) {
            aircraft.YearOfManufacture = $scope.times.manufacturingYear && moment($scope.times.manufacturingYear + "-01-01T00:00:00+0000");
            $modalInstance.close(aircraft);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
}
