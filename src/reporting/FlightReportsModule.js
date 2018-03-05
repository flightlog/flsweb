import angular from 'angular';
import coreModule from '../core/CoreModule';
import * as flightReportsServices from './FlightReportsServices';
import flightReportsController from './FlightReportsController';
import {userAuth} from '../core/AuthService';
import uiBootstrap from 'angular-ui-bootstrap';
import ngStorage from 'ngstorage';
import highChartsNgModule from 'highcharts-ng/dist/highcharts-ng.min'
import 'ng-table';
import 'angular-local-storage';

export default angular.module('fls.flightreports',
        [
            'ngTable',
            'LocalStorageModule',
            coreModule.name,
            ngStorage.name,
            uiBootstrap,
            highChartsNgModule
        ])
    .controller('FlightReportsController', flightReportsController)
    .service('FlightReports', flightReportsServices.FlightReports)
    .service('PagedFlights', flightReportsServices.PagedFlights)
    .service('FilterCache', flightReportsServices.FilterCache)
    .config(function($routeProvider) {
        $routeProvider
            .when('/flights',
                {
                    controller: flightReportsController,
                    template: require('./flightreports.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "FLIGHTREPORTS"
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
    });