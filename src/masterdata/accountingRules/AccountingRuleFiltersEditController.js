export default class AccountingRuleFiltersEditController {
    constructor($scope, $routeParams, $location, NgTableParams, GLOBALS, AuthService, AccountingRuleFilterService,
                PagedAccountingRuleFilters, AccountingRuleFilter, MessageManager, DropdownItemsRenderService, AccountingRuleFilterTypesService) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();
        $scope.md = {};
        $scope.renderAccountingRuleFilterType = DropdownItemsRenderService.accountingRuleFilterTypeRenderer();

        if ($routeParams.id !== undefined) {
            AccountingRuleFilterTypesService.getAccountingRuleFilterTypes().then((result) => {
                $scope.md.accountingRuleFilterTypes = result;
            });

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
        $scope.save = function (accountingRuleFilter) {
            $scope.busy = true;
            var p = new AccountingRuleFilter(accountingRuleFilter);
            if (accountingRuleFilter.AccountingRuleFilterId) {
                p.$saveAccountingRuleFilter({id: accountingRuleFilter.AccountingRuleFilterId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'accountingRuleFilter'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'accountingRuleFilter'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.deleteAccountingRuleFilter = function (accountingRuleFilter) {
            AccountingRuleFilterService.delete(accountingRuleFilter)
                .then(() => {
                    $scope.tableParams.reload();
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'accountingRuleFilter'));
        };


        $scope.newAccountingRuleFilter = function () {
            $location.path('/masterdata/accountingRuleFilters/new');
        };

        $scope.editAccountingRuleFilter = function (accountingRuleFilter) {
            $location.path('/masterdata/accountingRuleFilters/' + accountingRuleFilter.AccountingRuleFilterId);
        };
    }
}

