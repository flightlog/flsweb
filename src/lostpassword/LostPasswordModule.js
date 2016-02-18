import angular from 'angular';
import coreModule from '../core/CoreModule';
import LostPasswordController from './LostPasswordController';

export default angular.module('fls.lostpassword', [
        coreModule.name
    ])
    .controller('LostPasswordController', LostPasswordController)
    .config(($routeProvider) => {
        $routeProvider
            .when('/lostpassword',
                {
                    bindToController: true,
                    controllerAs: 'ctrl',
                    controller: LostPasswordController,
                    template: require('./lostpassword.html'),
                    publicAccess: true
                });
    });
