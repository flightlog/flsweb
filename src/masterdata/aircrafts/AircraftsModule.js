import angular from 'angular';
import clubsModule from '../clubs/ClubsModule';
import coreModule from '../../core/CoreModule';
import personsModule from '../persons/PersonsModule';
import AircraftsEditController from './AircraftsEditController';
import AircraftsEditDirective from './AircraftsEditDirective';
import AircraftFormDirective from './AircraftFormDirective';
import AircraftTypes from './AircraftTypes';
import * as AircraftsServices from './AircraftsServices';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.aircrafts', [
        coreModule.name,
        clubsModule.name,
        personsModule.name
    ])
    .directive('flsAircrafts', AircraftsEditDirective.factory)
    .directive('flsAircraftForm', AircraftFormDirective.factory)
    .service('Aircraft', AircraftsServices.Aircraft)
    .service('Aircrafts', AircraftsServices.Aircrafts)
    .service('AircraftsOverviews', AircraftsServices.AircraftsOverviews)
    .service('AircraftService', AircraftsServices.AircraftService)
    .service('AircraftTypes', AircraftTypes)
    .controller('AircraftsEditController', AircraftsEditController)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/aircrafts',
                {
                    controller: AircraftsEditController,
                    template: require('./aircrafts.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                })
            .when('/masterdata/aircrafts/:id',
                {
                    controller: AircraftsEditController,
                    template: require('./aircrafts-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                });
    });

