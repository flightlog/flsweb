import angular from 'angular';
import coreModule from '../core/CoreModule';
import * as FlightsServices from './FlightsServices';
import FlightsController from './FlightsController';
import personsModule from '../masterdata/persons/PersonsModule';
import GliderFormDirective from './GliderFormDirective';
import TowFormDirective from './TowFormDirective';
import FlightStatusDirective from './FlightStatusDirective';
import FlightStateFilterDropdownDirective from './FlightStateFilterDropdownDirective';
import flightTypesModule from '../masterdata/flightTypes/FlightTypesModule';
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
    uiBootstrap,
    highChartsNgModule
])
    .controller('FlightsController', FlightsController)
    .directive('flsFlightEditGliderForm', GliderFormDirective.factory)
    .directive('flsFlightEditTowForm', TowFormDirective.factory)
    .directive('flsFlightStatus', FlightStatusDirective.factory)
    .directive('flsFlightStatusFilter', FlightStateFilterDropdownDirective.factory)
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
                        titleKey: () => "FLIGHTS"
                    }
                })
            .when('/flights/:id',
                {
                    controller: FlightsController,
                    template: require('./flight-edit-form.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "FLIGHTS"
                    }
                })
            .when('/flights/copy/:id',
                {
                    controller: FlightsController,
                    template: require('./flight-edit-form.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "FLIGHTS"
                    }
                });
    })
    .config((ngTableFilterConfigProvider) => {
        ngTableFilterConfigProvider.setConfig({
            aliasUrls: {
                "flight-state": "./tableFilters/flight-state-filter.html"
            }
        });
    })
    .run(($templateCache) => {
        $templateCache.put("./tableFilters/flight-state-filter.html", require("./tableFilters/flight-state-filter.html"));
    });