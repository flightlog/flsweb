import angular from "angular";
import './styles/styles.js';
import './vendor/vendor.js';
import AppController from "./AppController";
import coreModule from "./core/CoreModule";
import mainModule from "./main/MainModule";
import lostPasswordModule from "./lostpassword/LostPasswordModule";
import tryFlightModule from "./tryflight/TryFlightModule";
import passengerFlightModule from "./passengerflight/PassengerFlightModule";
import masterdataModule from "./masterdata/MasterdataModule";
import flightsModule from "./flights/FlightsModule";
import airMovementFlightsModule from "./flights/airmovements/AirMovementsModule";
import planningModule from "./planning/PlanningModule";
import profileModule from "./profile/ProfileModule";
import systemModule from "./system/SystemModule";
import confirmEmailModule from "./confirm/ConfirmEmailModule";
import reservationSchedulerModule from "./reservation-scheduler/ReservationSchedulerModule";
import flightReportsModule from "./reporting/FlightReportsModule";
import angularTranslateModule from "angular-translate";
import angularTranslateUrlModule from "angular-translate-loader-url";

angular.module('app.starter', [
    angularTranslateModule,
    angularTranslateUrlModule,
    coreModule.name,
    mainModule.name,
    tryFlightModule.name,
    passengerFlightModule.name,
    lostPasswordModule.name,
    profileModule.name,
    planningModule.name,
    masterdataModule.name,
    flightsModule.name,
    confirmEmailModule.name,
    airMovementFlightsModule.name,
    systemModule.name,
    reservationSchedulerModule.name,
    flightReportsModule.name
])
    .controller('AppController', AppController)
    .config(($translateProvider, GLOBALS) => {
        $translateProvider.useUrlLoader(GLOBALS.BASE_URL + '/api/v1/translations');
        $translateProvider.useLoaderCache(true);
        $translateProvider.preferredLanguage('de');
        $translateProvider.useSanitizeValueStrategy(null);
    })
    .run(($rootScope, $location, AuthService) => {
        $rootScope.$on("$routeChangeSuccess",
            () => {
                AuthService.setShowNavBar($location.path() !== '/tryflight' || $location.path() !== '/passengerflight');
            });
    });

angular.bootstrap(document, ['app.starter']);
