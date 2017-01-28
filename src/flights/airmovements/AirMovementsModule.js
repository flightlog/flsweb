import angular from 'angular';
import coreModule from '../../core/CoreModule';
import * as AirMovementsServices from './AirMovementsServices';
import AirMovementsController from './AirMovementsController';
import personsModule from '../../masterdata/persons/PersonsModule';
import AirMovementStatusDirective from './AirMovementStatusDirective';
import AirMovementEditFormDirective from './AirMovementEditFormDirective';
import {userAuth} from '../../core/AuthService';
import uiBootstrap from 'angular-ui-bootstrap';
import ngStorage from 'ngstorage';
import highChartsNgModule from 'highcharts-ng/dist/highcharts-ng.min'
import 'ng-table';

export default angular.module('fls.airMovements.airmovements', [
    'ngTable',
    coreModule.name,
    personsModule.name,
    ngStorage.name,
    uiBootstrap,
    highChartsNgModule
])
    .controller('AirMovementsController', AirMovementsController)
    .directive('flsAirMovementEditForm', AirMovementEditFormDirective.factory)
    .directive('flsAirMovementStatus', AirMovementStatusDirective.factory)
    .service('AirMovements', AirMovementsServices.AirMovements)
    .service('AirMovementsDateRange', AirMovementsServices.AirMovementsDateRange)
    .service('AircraftOperatingCounters', AirMovementsServices.AircraftOperatingCounters)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/airmovements',
                {
                    controller: AirMovementsController,
                    template: require('./air-movements.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                })
            .when('/airmovements/:id',
                {
                    controller: AirMovementsController,
                    template: require('./air-movement-edit-form.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                });
    });