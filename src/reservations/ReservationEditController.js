import moment from "moment";

export default class ReservationEditController {
    constructor($scope, GLOBALS, $q, $routeParams, $location,
                AuthService, Reservations, ReservationTypes,
                ReservationUpdater, ReservationInserter, Locations, Persons, PagedPersons, ReservationService,
                AircraftsOverviews, ReservationValidator, NavigationCache, MessageManager, DropdownItemsRenderService) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.form = {};
        let prefillMoment = moment($routeParams['date']) || moment();
        let prefillLocationId = $routeParams['locationId'];

        $scope.renderGliderPilot = DropdownItemsRenderService.personRenderer((person) => {
            return person.HasGliderInstructorLicence
                || person.HasGliderPilotLicence
                || person.HasMotorPilotLicence
                || person.HasMotorInstructorLicence
                || person.HasTowPilotLicence
                || person.HasTMGLicence
                || person.HasGliderTraineeLicense;
        });
        $scope.renderSecondCrewPerson = DropdownItemsRenderService.personRenderer();

        $scope.renderAircraft = DropdownItemsRenderService.aircraftRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();
        let suggestedStart = prefillMoment.clone().hour(10).minute(0).second(0).toDate();
        let suggestedStop = prefillMoment.clone().hour(18).minute(0).second(0).toDate();
        $scope.busy = true;
        $scope.md = {};

        function loadMasterData() {
            return $q.all([
                AircraftsOverviews.query().$promise.then((result) => {
                    $scope.md.aircrafts = result;
                }),
                ReservationTypes.query().$promise.then((result) => {
                    $scope.md.reservationTypes = result;
                }),
                PagedPersons.getAllPersons().then((result) => {
                    $scope.md.persons = result;
                }),
                Locations.getLocations().$promise.then((result) => {
                    $scope.md.locations = result;
                })
            ]);
        }

        function loadReservation(user) {
            let deferred = $q.defer();
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

        function mapReservationEditMode(result) {
            if (result) {
                $scope.editAllowed = result.CanUpdateRecord;
                $scope.reservation = result;
                $scope.reservation.CanUpdateRecord = $scope.reservation.CanUpdateRecord && $routeParams.mode === 'edit';
                $scope.reservation.IsAllDayReservation = $scope.reservation.IsAllDayReservation || false;
                $scope.reservation._start = !$scope.reservation.IsAllDayReservation && moment(result.Start).clone() || suggestedStart;
                $scope.reservation.End = !$scope.reservation.IsAllDayReservation && result.End || suggestedStop;
            }
        }

        loadMasterData()
            .then(() => loadReservation(AuthService.getUser()))
            .then(mapReservationEditMode)
            .catch(_.partial(MessageManager.raiseError, 'load', 'reservation'))
            .finally(() => {
                $scope.selectedReservationTypeChanged();
                $scope.selectedAircraftChanged();
                $scope.form.reservationForm.ReservationTypeId.$validate();
                $scope.busy = false;
            });

        $scope.cancel = function () {
            $location.path(NavigationCache.cancellingLocation || '/reservations');
        };
        $scope.save = function (reservation) {
            $scope.busy = true;
            let dt = new Date(reservation.Start);
            let filteredDate = moment(dt).format('YYYY-MM-DD');
            if (reservation.IsAllDayReservation) {
                reservation.Start = filteredDate;
                reservation.End = filteredDate;
            } else {
                let startMoment = moment(reservation._start);
                let endMoment = moment(reservation.End);
                reservation.Start = moment(reservation.Start).hours(startMoment.hours()).minutes(startMoment.minutes());
                reservation.End = moment(reservation.Start).hours(endMoment.hours()).minutes(endMoment.minutes());
            }
            reservation = Object.assign({}, reservation);
            reservation._start = undefined;
            if (reservation.AircraftReservationId) {
                let r = new ReservationUpdater(reservation);
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

        let showSecondCrew = () => {
            return $scope.selectedReservationType
                && ($scope.selectedReservationType.IsInstructorRequired
                    || $scope.selectedReservationType.IsObserverPilotOrInstructorRequired
                    || $scope.selectedReservationType.IsPassengerRequired && ($scope.selectedAircraft && $scope.selectedAircraft.NrOfSeats > 1))
                || ($scope.selectedAircraft && $scope.selectedAircraft.NrOfSeats > 1);
        };

        let secondCrewMandatory = () => {
            return showSecondCrew() && $scope.selectedReservationType
                && ($scope.selectedReservationType.IsInstructorRequired
                    || $scope.selectedReservationType.IsObserverPilotOrInstructorRequired
                    || $scope.selectedReservationType.IsPassengerRequired);
        };

        let secondCrewLabel = () => {
            if ($scope.selectedReservationType) {
                if ($scope.selectedReservationType.IsInstructorRequired) {
                    return "INSTRUCTOR";
                }
                if ($scope.selectedReservationType.IsObserverPilotOrInstructorRequired) {
                    return "OBSERVER";
                }
                if ($scope.selectedReservationType.IsPassengerRequired) {
                    return "PASSENGER";
                }
            }

            return "SECOND_CREW_MEMBER";
        };

        $scope.selectedReservationTypeChanged = () => {
            setTimeout(() => {
                $scope.selectedReservationType = $scope.md.reservationTypes
                    .find(reservationType => reservationType.AircraftReservationTypeId === $scope.reservation.ReservationTypeId);
                $scope.showSecondCrew = showSecondCrew();
                $scope.isSecondCrewMandatory = secondCrewMandatory();
                $scope.secondCrewLabel = secondCrewLabel();

                $scope.$apply();
            }, 0);
        };

        $scope.selectedAircraftChanged = () => {
            setTimeout(() => {
                $scope.selectedAircraft = $scope.md.aircrafts
                    .find(aircraft => aircraft.AircraftId === $scope.reservation.AircraftId);
                $scope.showSecondCrew = showSecondCrew();
                $scope.isSecondCrewMandatory = secondCrewMandatory();
                $scope.secondCrewLabel = secondCrewLabel();

                $scope.$apply();
            }, 0);
        };

        $scope.edit = function (reservation) {
            $location.path('/reservations/' + reservation.AircraftReservationId + '/edit');
        };

        $scope.delete = (reservation) => {
            let deletedPromise = ReservationService.delete(reservation, $scope);
            if (deletedPromise) {
                deletedPromise.then($scope.cancel);
            }
        };
    }
}

