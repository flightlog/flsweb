import angular from 'angular';
import coreModule from '../../core/CoreModule';
import FlightTypesEditController from './FlightTypesEditController';
import FlightTypesEditDirective from './FlightTypesEditDirective';
import FlightTypeFormDirective from './FlightTypeFormDirective';
import * as FlightTypesServices from './FlightTypesServices';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.flightTypes', [
        coreModule.name
    ])
    .directive('flsFlightTypes', FlightTypesEditDirective.factory)
    .directive('flsFlightTypeForm', FlightTypeFormDirective.factory)
    .service('FlightType', FlightTypesServices.FlightType)
    .service('FlightTypes', FlightTypesServices.FlightTypes)
    .service('FlightTypeService', FlightTypesServices.FlightTypeService)
    .controller('FlightTypesEditController', FlightTypesEditController)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/flightTypes',
                {
                    controller: FlightTypesEditController,
                    template: require('./flight-types.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                })
            .when('/masterdata/flightTypes/:id',
                {
                    controller: FlightTypesEditController,
                    template: require('./flight-types-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                });
    });

