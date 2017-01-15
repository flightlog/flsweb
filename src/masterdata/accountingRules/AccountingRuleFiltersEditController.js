export default class AccountingRuleFiltersEditController {
    constructor($scope, $routeParams, $location, GLOBALS, AuthService,
                PagedAccountingRuleFilters, NgTableParams) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();
        $scope.filter = {};
        $scope.sorting = {
            AccountingRuleFilterName: 'asc'
        };

        if ($routeParams.id !== undefined) {
            console.log("not implemented");
        } else {
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    RuleFilterName: 'asc'
                },
                count: 100
            }, {
                counts:[],
                getData: function(params) {
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;
                    console.log("sorting", $scope.tableParams.sorting());

                    return PagedAccountingRuleFilters.getAccountingRuleFilters($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                        .then((result) => {
                            params.total(result.TotalRows);

                            return result.Items;
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
