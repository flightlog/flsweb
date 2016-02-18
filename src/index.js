import angular from 'angular';
import styles from './styles/styles.js';
import vendor from './vendor/vendor.js';
import AppController from './AppController';
import coreModule from './core/CoreModule';
import mainModule from './main/MainModule';
import lostPasswordModule from './lostpassword/LostPasswordModule';
import masterdataModule from './masterdata/MasterdataModule';
import flightsModule from './flights/FlightsModule';
import airMovementFlightsModule from './flights/airmovements/AirMovementsModule';
import planningModule from './planning/PlanningModule';
import profileModule from './profile/ProfileModule';
import systemModule from './system/SystemModule';
import confirmEmailModule from './confirm/ConfirmEmailModule';
import angularTranslateModule from 'angular-translate';
import angularTranslateUrlModule from 'angular-translate-loader-url';

angular.module('app.starter', [
        angularTranslateModule,
        angularTranslateUrlModule,
        coreModule.name,
        mainModule.name,
        lostPasswordModule.name,
        profileModule.name,
        planningModule.name,
        masterdataModule.name,
        flightsModule.name,
        confirmEmailModule.name,
        airMovementFlightsModule.name,
        systemModule.name
    ])
    .controller('AppController', AppController)
    .config(($translateProvider, GLOBALS) => {
        $translateProvider.useUrlLoader(GLOBALS.BASE_URL + '/api/v1/translations');
        $translateProvider.useLoaderCache(true);
        $translateProvider.preferredLanguage('de');
        $translateProvider.useSanitizeValueStrategy(null);
    });

angular.bootstrap(document, ['app.starter']);
