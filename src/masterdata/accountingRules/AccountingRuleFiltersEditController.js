export default class AccountingRuleFiltersEditController {
    constructor($scope, $routeParams, $location, NgTableParams, GLOBALS, AuthService,
                PagedAccountingRuleFilters) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();

        if ($routeParams.id !== undefined) {
            if ($routeParams.id === 'new') {
                $scope.accountingRuleFilter = {
                    CanUpdateRecord: true
                };
                $scope.busy = false;
            } else {
                PagedAccountingRuleFilters.getAccountingRuleFilter($routeParams.id)
                    .then((result) => {
                        $scope.accountingRuleFilter = result;
                    })
                    .finally(() => {
                        $scope.busy = false;
                    });
            }
        } else {
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    RuleFilterName: 'asc'
                },
                count: 100
            }, {
                counts: [],
                getData: function (params) {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    return PagedAccountingRuleFilters.getAccountingRuleFilters($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                        .then((result) => {
                            $scope.busy = false;
                            params.total(result.TotalRows);

                            return result.Items;
                        })
                        .finally(() => {
                            $scope.busy = false;
                        });
                }
            });
        }

        $scope.cancel = function () {
            $location.path('/masterdata/accountingRuleFilters');
        };

        $scope.newAccountingRuleFilter = function () {
            $location.path('/masterdata/accountingRuleFilters/new');
        };

        $scope.editAccountingRuleFilter = function (accountingRuleFilter) {
            $location.path('/masterdata/accountingRuleFilters/' + accountingRuleFilter.AccountingRuleFilterId);
        };
    }
}

