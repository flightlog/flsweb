import angular from 'angular';
import coreModule from '../core/CoreModule';
import angularTranslate from 'angular-translate';
import MainController from './MainController';
import DashboardController from './dashboard/DashboardController';
import DashboardDirective from './dashboard/DashboardDirective';
import {DashboardService, DashboardDataModelAdapter} from './dashboard/DashboardServices';

export default angular.module('fls.main', [
        angularTranslate,
        coreModule.name
    ])
    .controller('DashboardController', DashboardController)
    .directive('flsDashboard', DashboardDirective.factory)
    .controller('MainController', MainController)
    .service('dashboardService', DashboardService)
    .service('dashboardDataModelAdapter', DashboardDataModelAdapter)
    .config(($routeProvider) => {
        $routeProvider
            .when('/main',
                {
                    controller: MainController,
                    bindToController: true,
                    controllerAs: 'ctrl',
                    template: require('./main.html'),
                    publicAccess: true
                })
            .otherwise({redirectTo: '/main'});
    });
