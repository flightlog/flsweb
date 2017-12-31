import angular from 'angular';
import coreModule from '../../core/CoreModule';
import * as AirMovementsServices from './AirMovementsServices';
import AirMovementsController from './AirMovementsController';
import personsModule from '../../masterdata/persons/PersonsModule';
import AirMovementStatusDirective from './AirMovementStatusDirective';
import {AirMovementAirStateFilterDropdownDirective} from './AirMovementAirStateFilterDropdownDirective';
import {AirMovementProcessStateFilterDropdownDirective} from './AirMovementProcessStateFilterDropdownDirective';
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
    .directive('flsAirMovementAirStatusFilter', AirMovementAirStateFilterDropdownDirective.factory)
    .directive('flsAirMovementProcessStatusFilter', AirMovementProcessStateFilterDropdownDirective.factory)
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
                        user: userAuth,
                        titleKey: () => "MOTOR_MOVEMENTS"
                    }
                })
            .when('/airmovements/:id',
                {
                    controller: AirMovementsController,
                    template: require('./air-movement-edit-form.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "MOTOR_MOVEMENTS"
                    }
                })
            .when('/airmovements/copy/:id',
                {
                    controller: AirMovementsController,
                    template: require('./air-movement-edit-form.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "MOTOR_MOVEMENTS"
                    }
                });
    })
    .config((ngTableFilterConfigProvider) => {
        ngTableFilterConfigProvider.setConfig({
            aliasUrls: {
                "air-movement-air-state": "./tableFilters/air-movement-air-state-filter.html",
                "air-movement-process-state": "./tableFilters/air-movement-process-state-filter.html"
            }
        });
    })
    .run(($templateCache) => {
        $templateCache.put("./tableFilters/air-movement-air-state-filter.html", require("./tableFilters/air-movement-air-state-filter.html"));
        $templateCache.put("./tableFilters/air-movement-process-state-filter.html", require("./tableFilters/air-movement-process-state-filter.html"));
    });