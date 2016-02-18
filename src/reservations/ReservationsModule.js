import angular from 'angular';
import coreModule from '../core/CoreModule';
import {userAuth} from '../core/AuthService';
import ReservationsController from './ReservationsController';
import ReservationEditController from './ReservationEditController';
import ReservationsTableDirective from './ReservationsTableDirective';

export default angular.module('fls.reservations', [
    coreModule.name
])
    .directive('flsReservationsTable', ReservationsTableDirective.factory)
    .controller('ReservationsController', ReservationsController)
    .controller('ReservationEditController', ReservationEditController)
    .config(($routeProvider) => {
        $routeProvider
            .when('/reservations',
            {
                controller: ReservationsController,
                template: require('./reservations.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth
                }
            })
            .when('/reservations/:id/:mode',
            {
                controller: ReservationEditController,
                template: require('./reservations-edit.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth
                }
            });
    });

require('./ReservationsServices');