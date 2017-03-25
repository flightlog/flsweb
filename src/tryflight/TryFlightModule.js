import angular from 'angular';
import coreModule from '../core/CoreModule';
import TryflightController from './TryflightController';
import {TrialFlightResourceService} from './TrialFlightResourceService';

export default angular.module('fls.tryflight', [
        coreModule.name
    ])
    .controller('TryflightController', TryflightController)
    .service('TrialFlightResourceService', TrialFlightResourceService)
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
