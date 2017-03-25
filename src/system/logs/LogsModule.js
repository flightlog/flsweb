import angular from 'angular';
import LogsController from './LogsController';
import LogsDirective from './LogsDirective';
import coreModule from '../../core/CoreModule';
import * as LogsServices from './LogsServices';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.system.logs', [
        coreModule.name
    ])
    .directive('flsSystemLogsTable', LogsDirective.factory)
    .service('Logs', LogsServices.Logs)
    .controller('LogsController', LogsController)
    .config(($routeProvider) => {
        $routeProvider
            .when('/system/logs',
                {
                    controller: LogsController,
                    template: require('./logs.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "LOGS"
                    }
                });
    });

