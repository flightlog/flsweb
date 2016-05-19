import moment from 'moment';

export default class ReservationEditController {
    constructor($scope, GLOBALS, $q, $filter, $timeout, $routeParams, $location,
                AuthService, Reservations, ReservationTypes,
                ReservationUpdater, ReservationInserter, Locations, Persons,
                AircraftsOverviews, ReservationValidator, NavigationCache, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        var prefillMoment = moment($routeParams['date']) || moment();
        var prefillLocationId = $routeParams['locationId'];

        function renderPerson(person, escape) {
            return '<div class="option">' + escape(person.Firstname) + ' ' + escape(person.Lastname) + (person.City ? ' (' + escape(person.City) + ')' : '') + '</div>';
        }

        $scope.renderPerson = {
            option: renderPerson,
            item: renderPerson
        };

        function renderAircraft(aircraft, escape) {
            return '<div class="option">' + escape(aircraft.Immatriculation) +
                (aircraft.CompetitionSign ? ' [' + escape(aircraft.CompetitionSign) + ']' : '') +
                (aircraft.AircraftModel ? ' (' + escape(aircraft.AircraftModel) + ')' : '') + ' </div>';
        }

        $scope.renderAircraft = {
            option: renderAircraft,
            item: renderAircraft
        };

        $scope.busy = true;
        function loadReservation(user) {
            var deferred = $q.defer();
            if ($routeParams.id === 'new') {
                var res = {
                    CanUpdateRecord: true,
                    Day: prefillMoment.clone().hour(0).minute(0).second(0).toDate(),
                    Start: prefillMoment.clone().hour(10).minute(0).second(0).toDate(),
                    End: prefillMoment.clone().hour(18).minute(0).second(0).toDate(),
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
                }
                $scope.starttime = $filter('date')(result.Start, 'HH:mm');
                $scope.endtime = $filter('date')(result.End, 'HH:mm');
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
            // 'undo' the timezone offset from ui-datepicker again (so we end up on the original date again)
            var dt = new Date(reservation.Start);
            dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
            var filteredDate = $filter('date')(dt, 'yyyy-MM-dd');
            if (reservation.IsAllDayReservation) {
                reservation.Start = filteredDate;
                reservation.End = filteredDate;
            } else {
                reservation.Start = new Date(filteredDate + 'T' + $scope.starttime + ':00');
                reservation.End = new Date(filteredDate + 'T' + $scope.endtime + ':00');
            }
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

