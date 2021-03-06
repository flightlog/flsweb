import angular from 'angular';
import AccountingRuleFiltersEditController from './AccountingRuleFiltersEditController';
import AccountingRuleFiltersEditDirective from './AccountingRuleFiltersEditDirective';
import * as AccountingRuleFiltersServices from './AccountingRuleFiltersServices';
import {ArticlesService} from './ArticlesService';
import 'ng-table';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.accountingRuleFilters', ['ngTable'])
    .directive('flsAccountingRuleFilters', AccountingRuleFiltersEditDirective.factory)
    .controller('AccountingRuleFiltersEditController', AccountingRuleFiltersEditController)
    .service('PagedAccountingRuleFilters', AccountingRuleFiltersServices.PagedAccountingRuleFilters)
    .service('AccountingRuleFilter', AccountingRuleFiltersServices.AccountingRuleFilter)
    .service('AccountingRuleFilterService', AccountingRuleFiltersServices.AccountingRuleFilterService)
    .service('AccountingRuleFilterTypesService', AccountingRuleFiltersServices.AccountingRuleFilterTypesService)
    .service('FlightCrewTypesService', AccountingRuleFiltersServices.FlightCrewTypesService)
    .service('AccountingUnitTypesService', AccountingRuleFiltersServices.AccountingUnitTypesService)
    .service('ArticlesService', ArticlesService)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/accountingRuleFilters',
                {
                    controller: AccountingRuleFiltersEditController,
                    template: require('./accountingRuleFilters.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "ACCOUNTING_RULE_FILTERS"
                    }
                })
            .when('/masterdata/accountingRuleFilters/:id',
                {
                    controller: AccountingRuleFiltersEditController,
                    template: require('./accountingRuleFilters-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "ACCOUNTING_RULE_FILTERS"
                    }
                })
            .when('/masterdata/accountingRuleFilters/copy/:id',
                {
                    controller: AccountingRuleFiltersEditController,
                    template: require('./accountingRuleFilters-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "ACCOUNTING_RULE_FILTERS"
                    }
                });
    });

