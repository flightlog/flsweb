export default class AccountingRuleFiltersEditController {
    constructor($scope, $routeParams, $location, NgTableParams, GLOBALS, AuthService,
                PagedAccountingRuleFilters, AccountingRuleFilter, MessageManager, DropdownItemsRenderService) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();

        let filterTypes = {
            RecipientAccountingRuleFilter: 10,
            NoLandingTaxAccountingRuleFilter: 20,
            AircraftAccountingRuleFilter: 30,
            InstructorFeeAccountingRuleFilter: 40,
            AdditionalFuelFeeAccountingRuleFilter: 50,
            LandingTaxAccountingRuleFilter: 60,
            VsfFeeAccountingRuleFilter: 70
        };

        let filterTypeObjects = [];
        for (let key in filterTypes) {
            if (filterTypes.hasOwnProperty(key)) {
                filterTypeObjects.push({
                    AccountingRuleFilterTypeName: key,
                    AccountingRuleFilterTypeId: filterTypes[key]
                })
            }
        }
        $scope.renderAccountingRuleFilterType = DropdownItemsRenderService.accountingRuleFilterTypeRenderer();

        $scope.md = {
            accountingRuleFilterTypes: filterTypeObjects
        };

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


        $scope.newAccountingRuleFilter = function () {
            $location.path('/masterdata/accountingRuleFilters/new');
        };

        $scope.editAccountingRuleFilter = function (accountingRuleFilter) {
            $location.path('/masterdata/accountingRuleFilters/' + accountingRuleFilter.AccountingRuleFilterId);
        };
    }
}

