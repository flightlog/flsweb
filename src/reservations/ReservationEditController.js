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


        function appendZuluIfMissing(date) {
            // TODO clarify if we can get the server to send the timezone so we dont have to hardcode this to UTC
            let serialized = moment(date).format("YYYY-MM-DD HH:mm:ss");
            return moment(serialized + "Z").toDate();
        }

        var loadingReservationPromise = loadReservation(AuthService.getUser())
            .then(function (result) {
                if (result) {
                    $scope.editAllowed = result.CanUpdateRecord;
                    $scope.reservation = result;
                    $scope.reservation.CanUpdateRecord = $scope.reservation.CanUpdateRecord && $routeParams.mode === 'edit';
                    $scope.reservation.IsAllDayReservation = $scope.reservation.IsAllDayReservation || false;
                    $scope.reservation.Start = appendZuluIfMissing(result.Start);
                    $scope.reservation.End = appendZuluIfMissing(result.End);
                    $scope.reservation._start = moment(result.Start);
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
                reservation.Start = reservation._start;
                reservation._start = undefined;
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

