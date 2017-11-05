import angular from 'angular';
import coreModule from '../../core/CoreModule';
import {userAuth} from '../../core/AuthService';
import PersonCategoriesController from "./PersonCategoriesController"

export default angular.module('fls.masterdata.personCategories', [
    coreModule.name
])
    .controller('PersonCategoryController', PersonCategoriesController)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/personCategories',
                {
                    controller: PersonCategoriesController,
                    template: require('./person-categories.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "MEMBER_STATE"
                    }
                });
    });

