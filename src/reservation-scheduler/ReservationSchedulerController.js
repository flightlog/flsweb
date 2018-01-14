import moment from "moment";
import * as _ from "lodash";

const ESCAPE_CODE = 27;

export default class ReservationSchedulerController {

    constructor(GLOBALS,
                $q,
                $scope,
                $http,
                $location,
                $window,
                AuthService,
                ReservationInserter,
                AircraftsOverviews,
                PagedReservations,
                Reservations,
                ReservationUpdater,
                DropdownItemsRenderService,
                ReservationTypes,
                PagedPersons,
                ReservationService,
                Locations,
                NavigationCache,
                MessageManager) {

        NavigationCache.setCancellingLocationHere();
        $scope.isReservationAdmin = AuthService.isClubAdmin();
        $scope.busy = true;
        $scope.md = {};
        $scope.rows = [];
        $scope.headers = [];

        $scope.rowHeight = 30;
        $scope.cellWidth = 8;
        $scope.hoursPerDay = 24;

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


        function loadReservation(id, reservation) {
            let deferred = $q.defer();
            if (id === 'new') {
                deferred.resolve(Object.assign({}, reservation, {
                    CanUpdateRecord: true
                }));

                return deferred.promise;
            }
            return Reservations.get({subpath: id}).$promise;
        }

        $scope.myUser = AuthService.getUser();
        const masterDataPromises = [
            $http.get(GLOBALS.BASE_URL + '/api/v1/persons/my')
                .then((person) => {
                    $scope.person = person.data;
                }),
            $http.get(GLOBALS.BASE_URL + '/api/v1/clubs/my')
                .then((person) => {
                    $scope.club = person.data;
                }),
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
        ];

        function findResourceIndex(reservation) {
            for (let i = 0; i < $scope.md.aircrafts.length; i++) {
                if ($scope.md.aircrafts[i].Immatriculation === reservation.Immatriculation) {
                    return i;
                }
            }

            return 0;
        }

        function eventDurationFor(startMoment, allDay, endMoment) {
            if (allDay) {
                return 24;
            }

            return moment.duration(endMoment.diff(startMoment)).asHours();
        }

        function stripTimeZone(date) {
            let startWithoutTimeZone = moment(date).utc().format("YYYY-MM-DDTHH:mm:ss");

            return moment(startWithoutTimeZone);
        }

        function loadReservations() {
            $scope.busy = true;
            PagedReservations.getReservations({
                Start: {
                    From: moment().format("YYYY-MM-DD")
                }
            }, {}, 0, 1000)
                .then((reservations) => {
                    $scope.events = [];
                    $scope.now = moment().startOf("day");
                    $scope.calendarStartLocalTime = $scope.now.clone();

                    $scope.reservations = reservations;
                    reservations.Items.forEach(reservation => {
                        reservation.startTime = moment(reservation.Start);
                        let startLocalTime = reservation.startTime;
                        let startMoment = reservation.startTime;
                        let event = {
                            start: startMoment,
                            startCell: moment.duration(startLocalTime.diff($scope.calendarStartLocalTime)).asHours(),
                            durationHours: eventDurationFor(startMoment, reservation.IsAllDayReservation, moment(reservation.End)),
                            resourceIndex: findResourceIndex(reservation),
                            reservation: reservation
                        };

                        $scope.events.push(event);
                    });

                    let headerIdx = 0;
                    for (let i = 0; i < $scope.md.aircrafts.length; i++) {
                        $scope.rows[i] = [];
                        for (let j = 0; j < 365 * 24; j++) {
                            if (i === 0) {
                                if (j % 24 === 0) {
                                    $scope.headers[headerIdx++] = {
                                        start: $scope.now.clone(),
                                        formatted: $scope.now.clone().format("DD.MM.YYYY")
                                    };
                                }
                                $scope.now = $scope.now.add(1, "hours");
                            }
                            $scope.rows[i][j] = {
                                start: $scope.now.clone(),
                                events: []
                            };
                        }
                    }
                })
                .finally(() => {
                    $scope.busy = false;
                });
        }

        $q.all(masterDataPromises)
            .then(loadReservations);

        $scope.eventAction = (event) => {
            if (event) event.preventDefault();

            if ($scope.drawingEvent) {
                const e = $scope.clearDrawingEvent();
                if (event && e) {
                    $scope.busy = true;
                    $scope.updateDrawingEvent(e, event);
                    loadReservation('new', e.reservation)
                        .then((reservationDetails) => {
                            $scope.reservation = reservationDetails;
                            $scope.busy = false;
                        });
                }
            } else if (event) {
                const coordinates = {x: event.offsetX, y: event.offsetY};

                $scope.mouseLeft = coordinates.x;
                $scope.mouseTop = coordinates.y;
                let start = $scope.headers[0].start.clone().add(coordinates.x / $scope.cellWidth, "hours");
                let resourceIndex = Math.floor(coordinates.y / $scope.rowHeight) - 1;
                let eventStart = start.clone().minute($scope.floor15(start.minute())).second(0);

                $scope.drawingEvent = {
                    start: eventStart,
                    startCell: moment.duration(start.diff($scope.calendarStartLocalTime)).asHours(),
                    durationHours: 1,
                    resourceIndex: resourceIndex,
                    reservation: {
                        startDate: eventStart,
                        startTime: eventStart,
                        Start: eventStart.toDate(),
                        End: eventStart.clone().add(1, "hours").toDate(),
                        IsAllDayReservation: false,
                        AircraftId: $scope.md.aircrafts[resourceIndex].AircraftId,
                        PilotPersonId: $scope.person.PersonId,
                        LocationId: $scope.club.HomebaseId,
                        ReservationTypeId: $scope.md.reservationTypes[0].AircraftReservationTypeId
                    }
                };
            }
        };

        $scope.drawing = (event) => {
            if ($scope.drawingEvent) {
                $scope.updateDrawingEvent($scope.drawingEvent, event);
            }
        };

        $scope.eventClicked = (event) => {
            $scope.loadingDetails = true;

            loadReservation(event.reservation.AircraftReservationId)
                .then((reservationDetails) => {
                    $scope.reservation = Object.assign({}, reservationDetails, {
                        startDate: moment(reservationDetails.Start).clone(),
                        startTime: moment(reservationDetails.Start).clone()
                    });
                })
                .finally(() => {
                    $scope.loadingDetails = false;
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'reservation'));
        };

        $window.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.keyCode === ESCAPE_CODE) {
                $scope.clearDrawingEvent();
                $scope.reservation = undefined;
                $scope.$apply();
            }
        });

        $scope.floor15 = (minutes) => {
            return Math.round(minutes / 15) * 15;
        };

        $scope.updateDrawingEvent = (e, event) => {
            const coordinates = {x: event.offsetX, y: event.offsetY};
            $scope.mouseLeft = coordinates.x + 30;
            $scope.mouseTop = coordinates.y + 30;

            let end = $scope.headers[0].start.clone().add(coordinates.x / $scope.cellWidth, "hours");
            let durationHours = Math.round(moment.duration(end.diff(e.start)).asHours() * 4) / 4;

            if (durationHours > 0 && e.start.isSame(end, "d")) {
                e.durationHours = durationHours;
                e.reservation.End = end.clone().toDate()
            }
        };

        $scope.clearDrawingEvent = () => {
            const e = $scope.drawingEvent;
            if ($scope.drawingEvent) {
                delete $scope.drawingEvent;
            }

            return e;
        };


        $scope.cancel = function () {
            $scope.reservation = undefined;
        };

        $scope.save = function (reservationToSafe) {
            $scope.busy = true;
            let startDateString = moment(reservationToSafe.startDate).format("YYYY-MM-DD");
            let startTimeString = reservationToSafe.startTime.format("HH:mm:ss");
            let endTimeString = moment(reservationToSafe.End).format("HH:mm:ss");
            console.log(startDateString + " " + startTimeString + " ; " + endTimeString);
            let reservation = Object.assign({}, reservationToSafe, {
                Start: moment(startDateString + " " + startTimeString),
                End: moment(startDateString + " " + endTimeString),
                startDate: null,
                startTime: null
            });

            if (reservation.AircraftReservationId) {
                let r = new ReservationUpdater(reservation);
                r.$saveReservation({id: reservation.AircraftReservationId})
                    .then($scope.cancel)
                    .then(loadReservations)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'reservation'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                new ReservationInserter(reservation).$save()
                    .then($scope.cancel)
                    .then(loadReservations)
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

        $scope.delete = (reservation) => {
            let deletedPromise = ReservationService.delete(reservation, $scope);
            if (deletedPromise) {
                deletedPromise.then($scope.cancel)
                    .then(loadReservations);
            }
            $scope.reservation = undefined;
        };
    }

};
