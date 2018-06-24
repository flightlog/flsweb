import moment from "moment";

export default class PlanningDaysController {
    constructor(GLOBALS, $scope, $location, AuthService, PagedPlanningDays, NgTableParams, PlanningDaysDeleter, MessageManager, TableSettingsCacheFactory) {

        $scope.busy = false;
        $scope.loadingTable = false;
        $scope.debug = GLOBALS.DEBUG;
        $scope.isClubAdmin = AuthService.hasRole('ClubAdministrator');

        let tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("PlanningDaysController", {
            filter: {
                Day: {
                    From: moment().format("YYYY-MM-DD")
                }
            },
            sorting: {
                Day: 'asc'
            },
            count: 100
        });

        $scope.tableParams = new NgTableParams(tableSettingsCache.currentSettings(), {
            counts: [],
            getData: function (params) {
                $scope.busy = true;
                let pageSize = params.count();
                let pageStart = (params.page() - 1) * pageSize;

                return PagedPlanningDays.getPlanningDays($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                    .then((res) => {
                        $scope.busy = false;
                        tableSettingsCache.update($scope.tableParams.filter(), $scope.tableParams.sorting());
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
                    })
                    .finally(() => {
                        $scope.busy = false;
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
                        if ($scope.tableParams) {
                            $scope.tableParams.reload();
                        }
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

