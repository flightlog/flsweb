import angular from 'angular';
import coreModule from '../core/CoreModule';
import {userAuth} from '../core/AuthService';
import ReservationsController from './ReservationsController';
import ReservationEditController from './ReservationEditController';
import ReservationsTableDirective from './ReservationsTableDirective';
import * as ReservationsServices from './ReservationsServices';
import 'ng-table';

export default angular.module('fls.reservations', [
    'ngTable',
    coreModule.name
])
    .directive('flsReservationsTable', ReservationsTableDirective.factory)
    .controller('ReservationsController', ReservationsController)
    .controller('ReservationEditController', ReservationEditController)
    .service('PagedReservations', ReservationsServices.PagedReservations)
    .service('ReservationInserter', ReservationsServices.ReservationInserter)
    .service('ReservationUpdater', ReservationsServices.ReservationUpdater)
    .service('ReservationDeleter', ReservationsServices.ReservationDeleter)
    .service('Reservations', ReservationsServices.Reservations)
    .service('ReservationService', ReservationsServices.ReservationService)
    .service('ReservationTypes', ReservationsServices.ReservationTypes)
    .service('ReservationValidator', ReservationsServices.ReservationValidator)
    .config(($routeProvider) => {
        $routeProvider
            .when('/reservations',
            {
                controller: ReservationsController,
                template: require('./reservations.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth,
                    titleKey: () => "RESERVATIONS"
                }
            })
            .when('/reservations/:id/:mode',
            {
                controller: ReservationEditController,
                template: require('./reservations-edit.html'),
                publicAccess: true,
                resolve: {
                    user: userAuth,
                    titleKey: () => "RESERVATIONS"
                }
            });
    });