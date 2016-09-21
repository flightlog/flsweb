import moment from 'moment';

export default class ReservationEditController {
    constructor($scope, GLOBALS, $q, $timeout, $routeParams, $location,
                AuthService, Reservations, ReservationTypes,
                ReservationUpdater, ReservationInserter, Locations, Persons,
                AircraftsOverviews, ReservationValidator, NavigationCache, MessageManager, DropdownItemsRenderService) {

        $scope.debug = GLOBALS.DEBUG;
        var prefillMoment = moment($routeParams['date']) || moment();
        var prefillLocationId = $routeParams['locationId'];

        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderAircraft = DropdownItemsRenderService.aircraftRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();
        let suggestedStart = prefillMoment.clone().hour(10).minute(0).second(0).toDate();
        let suggestedStop = prefillMoment.clone().hour(18).minute(0).second(0).toDate();

        $scope.busy = true;
        function loadReservation(user) {
            var deferred = $q.defer();
            if ($routeParams.id === 'new') {
                let res = {
                    CanUpdateRecord: true,
                    Day: prefillMoment.clone().hour(0).minute(0).second(0).toDate(),
                    Start: suggestedStart,
                    End: suggestedStop,
                    IsAllDayReservation: true,
                    LocationId: prefillLocationId || user && user.LocationId,
                    PilotPersonId: user.PersonId
                };
                deferred.resolve(res);
                return deferred.promise;
            }
            return Reservations.get({subpath: $routeParams.id}).$promise;
        }

        var loadingReservationPromise = loadReservation(AuthService.getUser())
            .then(function (result) {
                if (result) {
                    $scope.editAllowed = result.CanUpdateRecord;
                    $scope.reservation = result;
                    $scope.reservation.CanUpdateRecord = $scope.reservation.CanUpdateRecord && $routeParams.mode === 'edit';
                    $scope.reservation.IsAllDayReservation = $scope.reservation.IsAllDayReservation || false;
                    $scope.reservation._start = !$scope.reservation.IsAllDayReservation && moment(result.Start).clone() || suggestedStart;
                    $scope.reservation.End = !$scope.reservation.IsAllDayReservation && result.End || suggestedStop;
                }
            })
            .then(function () {
                return Locations.getLocations();
            })
            .then(function (result) {
                $scope.locations = result;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'reservation'));

        $scope.cancel = function () {
            $location.path(NavigationCache.cancellingLocation || '/reservations');
        };
        $scope.save = function (reservation) {
            $scope.busy = true;
            var dt = new Date(reservation.Start);
            var filteredDate = moment(dt).format('YYYY-MM-DD');
            if (reservation.IsAllDayReservation) {
                reservation.Start = filteredDate;
                reservation.End = filteredDate;
            } else {
                var startMoment = moment(reservation._start);
                reservation.Start = moment(reservation.Start).hours(startMoment.hours()).minutes(startMoment.minutes());
            }
            reservation._start = undefined;
            if (reservation.AircraftReservationId) {
                var r = new ReservationUpdater(reservation);
                r.$saveReservation({id: reservation.AircraftReservationId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'reservation'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                new ReservationInserter(reservation).$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'reservation'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        var promises = [];
        promises.push(AircraftsOverviews.query().$promise
            .then(function (result) {
                $scope.aircrafts = result;
            }));
        promises.push(ReservationTypes.query().$promise
            .then(function (result) {
                $scope.reservationTypes = result;
            }));
        promises.push(Persons.getGliderPilots().$promise
            .then(function (result) {
                $scope.gliderPilots = result;
            }));
        promises.push(Persons.getGliderInstructors().$promise
            .then(function (result) {
                $scope.instructors = result;
            }));
        promises.push(loadingReservationPromise);

        $q.all(promises)
            .catch(_.partial(MessageManager.raiseError, 'load', 'masterdata'))
            .finally(function () {
                $scope.calculateInstructorRequired();
                $scope.busy = false;
            });

        $scope.calculateInstructorRequired = () => {
            $timeout(() => {
                $scope.instructorRequired = ReservationValidator.calculateInstructorRequired($scope.reservationTypes, $scope.reservation);
            }, 0);
        };
        $scope.edit = function (reservation) {
            $location.path('/reservations/' + reservation.AircraftReservationId + '/edit');
        };
    }
}

