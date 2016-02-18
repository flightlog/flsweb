export default class PlanningDaySetupController {
    constructor($scope, GLOBALS, $location, PlanningDaysRuleBased, Locations, Clubs, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;

        $scope.busy = true;

        $scope.setup = {
            EverySaturday: true,
            EverySunday: true
        };

        Clubs.query().$promise
            .then(function (result) {
                $scope.myClub = result;
                $scope.setup.LocationId = result.HomebaseId;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'clubs'));

        Locations.getLocations().$promise
            .then(function (result) {
                $scope.locations = result;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'locations'));

        $scope.generate = function (setup) {
            console.log('do generate: ' + JSON.stringify(setup));
            PlanningDaysRuleBased.runSetup(setup).$promise
                .then(function (result) {
                    console.log('success: ' + JSON.stringify(result));
                    $location.path('/planning');
                })
                .catch(_.partial(MessageManager.raiseError, 'setup', 'planning days'));
        };

        $scope.cancel = function () {
            $location.path('/planning');
        };
    }
}

