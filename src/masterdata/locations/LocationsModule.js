import angular from 'angular';
import LocationsEditController from './LocationsEditController';
import LocationsEditDirective from './LocationsEditDirective';
import LocationFormDirective from './LocationFormDirective';
import * as LocationsServices from './LocationsServices';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.locations', [])
    .directive('flsLocations', LocationsEditDirective.factory)
    .directive('flsLocationForm', LocationFormDirective.factory)
    .controller('LocationsEditController', LocationsEditController)
    .service('Locations', LocationsServices.Locations)
    .service('LocationService', LocationsServices.LocationService)
    .service('LocationPersister', LocationsServices.LocationPersister)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/locations',
            {
                controller: LocationsEditController,
                template: require('./locations.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth
                }
            })
            .when('/masterdata/locations/:id',
            {
                controller: LocationsEditController,
                template: require('./locations-edit.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth
                }
            });
    });

