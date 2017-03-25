import angular from 'angular';
import coreModule from '../core/CoreModule';
import TryflightController from './TryflightController';

export default angular.module('fls.tryflight', [
        coreModule.name
    ])
    .controller('TryflightController', TryflightController)
    .config(($routeProvider) => {
        $routeProvider
            .when('/tryflight',
                {
                    bindToController: true,
                    controllerAs: 'ctrl',
                    controller: TryflightController,
                    template: require('./tryflight.html'),
                    publicAccess: true
                });
    });
