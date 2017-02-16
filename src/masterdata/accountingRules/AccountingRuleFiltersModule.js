import angular from 'angular';
import AccountingRuleFiltersEditController from './AccountingRuleFiltersEditController';
import AccountingRuleFiltersEditDirective from './AccountingRuleFiltersEditDirective';
import * as AccountingRuleFiltersServices from './AccountingRuleFiltersServices';
import 'ng-table';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.accountingRuleFilters', ['ngTable'])
    .directive('flsAccountingRuleFilters', AccountingRuleFiltersEditDirective.factory)
    .controller('AccountingRuleFiltersEditController', AccountingRuleFiltersEditController)
    .service('PagedAccountingRuleFilters', AccountingRuleFiltersServices.PagedAccountingRuleFilters)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/accountingRuleFilters',
                {
                    controller: AccountingRuleFiltersEditController,
                    template: require('./accountingRuleFilters.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                })
            .when('/masterdata/accountingRuleFilters/:id',
                {
                    controller: AccountingRuleFiltersEditController,
                    template: require('./accountingRuleFilters-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                });
    });

