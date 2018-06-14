import angular from 'angular';
import coreModule from '../core/CoreModule';
import passengerflightController from './PassengerflightController';
import {PassengerFlightResourceService} from './PassengerFlightResourceService';
import "angular-recaptcha";

export default angular.module('fls.passengerflight', [
    coreModule.name,
    'vcRecaptcha'
])
    .controller('PassengerflightController', passengerflightController)
    .service('PassengerFlightResourceService', PassengerFlightResourceService)
    .config(($routeProvider) => {
        $routeProvider
            .when('/passengerflight',
                {
                    bindToController: true,
                    controllerAs: 'ctrl',
                    controller: passengerflightController,
                    template: require('./passengerflight.html'),
                    publicAccess: true
                });
    });
