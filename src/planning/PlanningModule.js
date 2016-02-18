import angular from 'angular';
import coreModule from '../core/CoreModule';
import PlanningDaysController from './PlanningDaysController';
import PlanningDayEditController from './PlanningDayEditController';
import PlanningDaySetupController from './PlanningDaySetupController';
import masterdataModule from '../masterdata/MasterdataModule';
import reservationsModule from '../reservations/ReservationsModule';
import {userAuth} from '../core/AuthService';

export default angular.module('fls.planning', [
        coreModule.name,
        masterdataModule.name,
        reservationsModule.name
    ])
    .controller('PlanningDaysController', PlanningDaysController)
    .controller('PlanningDayEditController', PlanningDayEditController)
    .controller('PlanningDaySetupController', PlanningDaySetupController)
    .config(($routeProvider) => {
        $routeProvider
            .when('/planning',
                {
                    controller: PlanningDaysController,
                    template: require('./planning.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                })
            .when('/planning/:id/:mode',
                {
                    controller: PlanningDayEditController,
                    template: require('./planning-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                })
            .when('/planningsetup',
                {
                    controller: PlanningDaySetupController,
                    template: require('./planning-setup.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth
                    }
                });
    });

require('./PlanningService');