import moment from 'moment';

export default class PlanningDaysController {
    constructor(GLOBALS, $scope, $location, PagedPlanningDays, NgTableParams, PlanningDaysDeleter, MessageManager) {

        $scope.busy = false;
        $scope.loadingTable = false;
        $scope.debug = GLOBALS.DEBUG;

        $scope.tableParams = new NgTableParams({
            filter: {},
            sorting: {
                Day: 'desc'
            },
            count: 10
        }, {
            counts: [],
            getData: function (params) {
                let pageSize = params.count();
                let pageStart = (params.page() - 1) * pageSize;
                $scope.loadingTable = true;

                return PagedPlanningDays.getPlanningDays($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                    .then((res) => {
                        $scope.loadingTable = false;
                        params.total(res.TotalRows);

                        let result = res.Items;
                        for (var i = 0; i < result.length; i++) {
                            var d = result[i];
                            var m = d.Day && moment(d.Day);
                            d.isSaturday = m && m.toDate().getDay() === 6;
                            d.isSunday = m && m.toDate().getDay() === 0;
                            d._formattedDate = m && m.format('DD.MM.YYYY dddd');
                        }

                        return result;
                    });
            }
        });

        $scope.edit = (planningDay) => {
            $location.path('/planning/' + planningDay.PlanningDayId + '/edit');
        };
        $scope.showPlanningDayDetails = (planningDay) => {
            $location.path('/planning/' + planningDay.PlanningDayId + '/view');
        };
        $scope.deletePlanningDay = (planningDay) => {
            if (window.confirm('Do you really want to delete this planningday?')) {
                PlanningDaysDeleter.deleteDay({id: planningDay.PlanningDayId}).$promise
                    .then(() => {
                        $scope.tableParams.reload();
                    })
                    .catch(_.partial(MessageManager.raiseError, 'delete', 'planned day'));
            }
        };
        $scope.new = () => {
            $location.path('/planning/new/edit');
        };
        $scope.setup = () => {
            $location.path('/planningsetup');
        };
    }
}

