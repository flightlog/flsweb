import angular from 'angular';
import * as _ from 'lodash';
import UsersEditController from './UsersEditController';
import UsersEditDirective from './UsersEditDirective';
import UserFormDirective from './UserFormDirective';
import * as UsersServices from './UsersServices';
import coreModule from '../../core/CoreModule';
import clubsModule from '../clubs/ClubsModule';
import {userAuth} from '../../core/AuthService';
import personsModule from '../persons/PersonsModule';

export default angular.module('fls.masterdata.users', [
        coreModule.name,
        personsModule.name,
        clubsModule.name
    ])
    .controller('UsersEditController', UsersEditController)
    .service('UserPersister', UsersServices.UserPersister)
    .service('Users', UsersServices.Users)
    .service('UserRoles', UsersServices.UserRoles)
    .service('UserService', UsersServices.UserService)
    .service('UserAccountStates', UsersServices.UserAccountStates)
    .directive('flsUsers', UsersEditDirective.factory)
    .directive('flsUserForm', UserFormDirective.factory)
    .filter('filterByUserState', function() {
        return function(users, filters) {
            return _.filter(users, (user) => {
                return filters[user.AccountState];
            });
        };
    })
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/users',
                {
                    controller: UsersEditController,
                    template: require('./users.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                })
            .when('/masterdata/users/:id',
                {
                    controller: UsersEditController,
                    template: require('./users-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                });
    });
