import angular from 'angular';
import coreModule from '../core/CoreModule';
import TryflightController from './TryflightController';
import {TrialFlightResourceService} from './TrialFlightResourceService';
import "angular-recaptcha";

export default angular.module('fls.tryflight', [
    coreModule.name,
    'vcRecaptcha'
])
    .controller('TryflightController', TryflightController)
    .service('TrialFlightResourceService', TrialFlightResourceService)
    .config(($routeProvider) => {
        $routeProvider
            .when('/trialflight',
                {
                    bindToController: true,
                    controllerAs: 'ctrl',
                    controller: TryflightController,
                    template: require('./tryflight.html'),
                    publicAccess: true
                });
    });
