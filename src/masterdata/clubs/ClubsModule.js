import angular from 'angular';
import ClubsEditController from './ClubsEditController';
import ClubsEditDirective from './ClubsEditDirective';
import ClubFormDirective from './ClubFormDirective';
import * as ClubsServices from './ClubsServices';
import coreModule from '../../core/CoreModule';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.clubs', [
    coreModule.name
])
    .directive('flsClubs', ClubsEditDirective.factory)
    .directive('flsClubForm', ClubFormDirective.factory)
    .service('ClubPersister', ClubsServices.ClubPersister)
    .service('Clubs', ClubsServices.Clubs)
    .service('PagedClubs', ClubsServices.PagedClubs)
    .service('ClubService', ClubsServices.ClubService)
    .controller('ClubsEditController', ClubsEditController)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/clubs',
            {
                controller: ClubsEditController,
                template: require('./clubs.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth
                }
            })
            .when('/masterdata/clubs/:id',
            {
                controller: ClubsEditController,
                template: require('./clubs-edit.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth
                }
            });
    });

