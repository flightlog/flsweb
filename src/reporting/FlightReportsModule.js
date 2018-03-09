import angular from 'angular';
import coreModule from '../core/CoreModule';
import * as flightReportsServices from './FlightReportsServices';
import flightReportsController from './FlightReportsController';
import {userAuth} from '../core/AuthService';
import uiBootstrap from 'angular-ui-bootstrap';
import ngStorage from 'ngstorage';
import highChartsNgModule from 'highcharts-ng/dist/highcharts-ng.min'
import flightsModule from '../flights/FlightsModule'
import 'ng-table';
import 'angular-local-storage';

export default angular.module('fls.flightreports',
        [
            'ngTable',
            'LocalStorageModule',
            coreModule.name,
            ngStorage.name,
            flightsModule.name,
            uiBootstrap,
            highChartsNgModule
        ])
    .controller('FlightReportsController', flightReportsController)
    .service('FlightReports', flightReportsServices.FlightReports)
    .config(function($routeProvider) {
        $routeProvider
            .when('/flightreports',
                {
                    controller: flightReportsController,
                    template: require('./flightreports.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "FLIGHTREPORTS"
                    }
                })
            .when('/flightreports/:type',
                {
                    controller: flightReportsController,
                    template: require('./flightreportresults.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "FLIGHTREPORTS"
                    }
                });
    });