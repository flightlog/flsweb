import moment from 'moment';

export default class PlanningDaysController {
    constructor(GLOBALS, $scope, $location, PlanningDays, PlanningDaysDeleter, MessageManager) {

        $scope.busy = true;
        $scope.debug = GLOBALS.DEBUG;

        PlanningDays.query().$promise
            .then(function (result) {
                for (var i = 0; i < result.length; i++) {
                    var d = result[i];
                    var m = d.Day && moment(d.Day);
                    d.isSaturday = m && m.toDate().getDay() === 6;
                    d.isSunday = m && m.toDate().getDay() === 0;
                    d._formattedDate = m && m.format('DD.MM.YYYY dddd');
                }
                $scope.planningDays = result;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'planned days'))
            .finally(function () {
                $scope.busy = false;
            });

        $scope.edit = function (planningDay) {
            $location.path('/planning/' + planningDay.PlanningDayId + '/edit');
        };
        $scope.view = function (planningDay) {
            $location.path('/planning/' + planningDay.PlanningDayId + '/view');
        };
        $scope.delete = function (planningDay) {
            if (window.confirm('Do you really want to delete this planningday?')) {
                PlanningDaysDeleter.deleteDay({id: planningDay.PlanningDayId}).$promise
                    .then(function (/*result*/) {
                        console.log('successfully removed planningDay.');
                        $scope.planningDays = _.filter($scope.planningDays, function (d) {
                            return d !== planningDay;
                        });
                    })
                    .catch(_.partial(MessageManager.raiseError, 'delete', 'planned day'));
            }
        };
        $scope.new = function () {
            $location.path('/planning/new/edit');
        };
        $scope.setup = function () {
            $location.path('/planningsetup');
        };
    }
}

