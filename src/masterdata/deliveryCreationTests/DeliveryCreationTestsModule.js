import angular from 'angular';
import DeliveryCreationTestsEditController from './DeliveryCreationTestsEditController';
import DeliveryCreationTestsEditDirective from './DeliveryCreationTestsEditDirective';
import * as DeliveryCreationTestsServices from './DeliveryCreationTestsServices';
import 'ng-table';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.deliveryCreationTests', ['ngTable'])
    .directive('flsDeliveryCreationTests', DeliveryCreationTestsEditDirective.factory)
    .controller('DeliveryCreationTestsEditController', DeliveryCreationTestsEditController)
    .service('PagedDeliveryCreationTests', DeliveryCreationTestsServices.PagedDeliveryCreationTests)
    .service('DeliveryCreationTest', DeliveryCreationTestsServices.DeliveryCreationTest)
    .service('DeliveryCreationTestService', DeliveryCreationTestsServices.DeliveryCreationTestService)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/deliveryCreationTests',
                {
                    controller: DeliveryCreationTestsEditController,
                    template: require('./deliveryCreationTests.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "DELIVERY_CREATION_TESTS"
                    }
                })
            .when('/masterdata/deliveryCreationTests/:id',
                {
                    controller: DeliveryCreationTestsEditController,
                    template: require('./deliveryCreationTests-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "DELIVERY_CREATION_TESTS"
                    }
                });
    });

