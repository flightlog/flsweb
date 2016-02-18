import angular from 'angular';
import coreModule from '../core/CoreModule'
import personsModule from '../masterdata/persons/PersonsModule'
import ProfileController from './ProfileController';
import {userAuth} from '../core/AuthService';

export default angular.module('profile', [
        coreModule.name,
        personsModule.name
    ])
    .controller('ProfileController', ProfileController)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/profile',
                {
                    controller: ProfileController,
                    template: require('./profile.html'),
                    publicAccess: false,
                    resolve: {
                        user: userAuth
                    }
                });
    });