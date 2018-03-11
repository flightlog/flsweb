import angular from 'angular';
import coreModule from '../core/CoreModule';
import * as FlightsServices from './FlightsServices';
import FlightsController from './FlightsController';
import personsModule from '../masterdata/persons/PersonsModule';
import GliderFormDirective from './GliderFormDirective';
import TowFormDirective from './TowFormDirective';
import FlightStatusDirective from './FlightStatusDirective';
import AirStateFilterDropdownDirective from './AirStateFilterDropdownDirective';
import ProcessStateFilterDropdownDirective from './ProcessStateFilterDropdownDirective';
import flightTypesModule from '../masterdata/flightTypes/FlightTypesModule';
import aircraftsModule from '../masterdata/aircrafts/AircraftsModule';
import {userAuth} from '../core/AuthService';
import uiBootstrap from 'angular-ui-bootstrap';
import ngStorage from 'ngstorage';
import highChartsNgModule from 'highcharts-ng/dist/highcharts-ng.min'
import 'ng-table';
import 'angular-local-storage';

export default angular.module('fls.flights', [
    'ngTable',
    'LocalStorageModule',
    coreModule.name,
    personsModule.name,
    ngStorage.name,
    flightTypesModule.name,
    aircraftsModule.name,
    uiBootstrap,
    highChartsNgModule
])
    .controller('FlightsController', FlightsController)
    .directive('flsFlightEditGliderForm', GliderFormDirective.factory)
    .directive('flsFlightEditTowForm', TowFormDirective.factory)
    .directive('flsFlightStatus', FlightStatusDirective.factory)
    .directive('flsAirStatusFilter', AirStateFilterDropdownDirective.factory)
    .directive('flsProcessStatusFilter', ProcessStateFilterDropdownDirective.factory)
    .service('FlightCostBalanceTypes', FlightsServices.FlightCostBalanceTypes)
    .service('Flights', FlightsServices.Flights)
    .service('PagedFlights', FlightsServices.PagedFlights)
    .service('FilterCache', FlightsServices.FilterCache)
    .service('SoloFlightCheckboxEnablementCalculator', FlightsServices.SoloFlightCheckboxEnablementCalculator)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/flights',
                {
                    controller: FlightsController,
                    template: require('./flights.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "STARTLIST"
                    }
                })
            .when('/flights/:id',
                {
                    controller: FlightsController,
                    template: require('./flight-edit-form.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "STARTLIST"
                    }
                })
            .when('/flights/copy/:id',
                {
                    controller: FlightsController,
                    template: require('./flight-edit-form.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "STARTLIST"
                    }
                });
    })
    .config((ngTableFilterConfigProvider) => {
        ngTableFilterConfigProvider.setConfig({
            aliasUrls: {
                "air-state": "./tableFilters/air-state-filter.html",
                "process-state": "./tableFilters/process-state-filter.html"
            }
        });
    })
    .run(($templateCache) => {
        $templateCache.put("./tableFilters/air-state-filter.html", require("./tableFilters/air-state-filter.html"));
        $templateCache.put("./tableFilters/process-state-filter.html", require("./tableFilters/process-state-filter.html"));
    });