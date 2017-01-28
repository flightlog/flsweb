import angular from 'angular';
import coreModule from '../core/CoreModule';
import PlanningDaysController from './PlanningDaysController';
import PlanningDayEditController from './PlanningDayEditController';
import PlanningDaySetupController from './PlanningDaySetupController';
import masterdataModule from '../masterdata/MasterdataModule';
import reservationsModule from '../reservations/ReservationsModule';
import * as PlanningService from './PlanningService';
import {userAuth} from '../core/AuthService';
import 'ng-table';

export default angular.module('fls.planning', [
    'ngTable',
    coreModule.name,
    masterdataModule.name,
    reservationsModule.name
])
    .controller('PlanningDaysController', PlanningDaysController)
    .controller('PlanningDayEditController', PlanningDayEditController)
    .controller('PlanningDaySetupController', PlanningDaySetupController)
    .service('PagedPlanningDays', PlanningService.PagedPlanningDays)
    .service('PlanningDayReader', PlanningService.PlanningDayReader)
    .service('PlanningDays', PlanningService.PlanningDays)
    .service('PlanningDaysInserter', PlanningService.PlanningDaysInserter)
    .service('PlanningDaysUpdater', PlanningService.PlanningDaysUpdater)
    .service('PlanningDaysDeleter', PlanningService.PlanningDaysDeleter)
    .service('PlanningDaysRuleBased', PlanningService.PlanningDaysRuleBased)
    .service('ReservationsByPlanningDay', PlanningService.ReservationsByPlanningDay)
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
