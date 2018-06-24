import angular from 'angular';
import DeliveriesEditController from './DeliveriesEditController';
import DeliveriesEditDirective from './DeliveriesEditDirective';
import * as DeliveriesServices from './DeliveriesServices';
import 'ng-table';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.deliveries', ['ngTable'])
    .directive('flsDeliveries', DeliveriesEditDirective.factory)
    .controller('DeliveriesEditController', DeliveriesEditController)
    .service('DeliveryService', DeliveriesServices.DeliveryService)
    .service('Delivery', DeliveriesServices.Delivery)
    .service('PagedDeliveries', DeliveriesServices.PagedDeliveries)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/deliveries',
                {
                    controller: DeliveriesEditController,
                    template: require('./deliveries.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "DELIVERIES"
                    }
                })
            .when('/masterdata/deliveries/:id',
                {
                    controller: DeliveriesEditController,
                    template: require('./deliveries-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "DELIVERIES"
                    }
                });
    });

