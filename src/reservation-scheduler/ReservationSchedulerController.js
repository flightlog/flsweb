import moment from "moment";

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
                ReservationTypes,
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
            AircraftsOverviews.query().$promise
                .then((result) => {
                    $scope.md.aircrafts = result;
                }),
            ReservationTypes.query().$promise
                .then((result) => {
                    $scope.md.reservationTypes = result;
                    $scope.md.defaultReservationType = result[0];
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
            $scope.events = [];
            PagedReservations.getReservations({
                Start: {
                    From: moment().format("YYYY-MM-DD")
                }
            }, {}, 0, 1000)
                .then((reservations) => {
                    $scope.now = moment().startOf("day");
                    $scope.calendarStartLocalTime = $scope.now.clone();

                    $scope.reservations = reservations;
                    reservations.Items.forEach(reservation => {
                        let startLocalTime = stripTimeZone(reservation.Start);
                        let startMoment = moment(reservation.Start);
                        let event = {
                            start: startMoment,
                            startCell: moment.duration(startLocalTime.diff($scope.calendarStartLocalTime)).asHours(),
                            durationHours: eventDurationFor(startMoment, reservation.IsAllDayReservation, moment(reservation.End)),
                            resourceIndex: findResourceIndex(reservation),
                            reservation: reservation
                        };

                        console.log("event", event);
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

                    new ReservationInserter(e.reservation).$save()
                        .then(loadReservations)
                        .catch(_.partial(MessageManager.raiseError, 'insert', 'reservation'))
                        .finally(function () {
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
                        Start: eventStart,
                        End: eventStart.clone().add(1, "hours"),
                        IsAllDayReservation: false,
                        AircraftId: $scope.md.aircrafts[resourceIndex].AircraftId,
                        PilotPersonId: $scope.person.PersonId,
                        LocationId: $scope.club.HomebaseId,
                        ReservationTypeId: $scope.md.defaultReservationType.AircraftReservationTypeId
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
            $location.path("/reservations/" + event.reservation.AircraftReservationId + "/edit");
        };

        $window.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.keyCode === ESCAPE_CODE) {
                $scope.clearDrawingEvent();
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
                e.reservation.End = end.clone()
            }
        };

        $scope.clearDrawingEvent = () => {
            const e = $scope.drawingEvent;
            if ($scope.drawingEvent) {
                delete $scope.drawingEvent;
            }

            return e;
        };
    }

}
