import angular from 'angular';
import LocationsEditController from './LocationsEditController';
import LocationsEditDirective from './LocationsEditDirective';
import LocationFormDirective from './LocationFormDirective';
import * as LocationsServices from './LocationsServices';
import 'ng-table';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.locations', ['ngTable'])
    .directive('flsLocations', LocationsEditDirective.factory)
    .directive('flsLocationForm', LocationFormDirective.factory)
    .controller('LocationsEditController', LocationsEditController)
    .service('Locations', LocationsServices.Locations)
    .service('PagedLocations', LocationsServices.PagedLocations)
    .service('LocationService', LocationsServices.LocationService)
    .service('LocationPersister', LocationsServices.LocationPersister)
    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    })
    .config(($routeProvider, ngTableFilterConfigProvider) => {
        ngTableFilterConfigProvider.setConfig({
            aliasUrls: {
                "countries": "./countries-dropdown-filter.html"
            }
        });

        $routeProvider
            .when('/masterdata/locations',
                {
                    controller: LocationsEditController,
                    template: require('./locations.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "LOCATIONS"
                    }
                })
            .when('/masterdata/locations/:id',
                {
                    controller: LocationsEditController,
                    template: require('./locations-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "LOCATIONS"
                    }
                });
    })
    .run(($templateCache) => {
        $templateCache.put("./countries-dropdown-filter.html", require("./countries-dropdown-filter.html"));
    });

