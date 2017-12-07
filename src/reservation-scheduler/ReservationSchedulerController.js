import moment from "moment";

export default class ReservationSchedulerController {

    constructor($scope, $location, AuthService, ReservationService, AircraftsOverviews, PagedReservations, NavigationCache) {
        NavigationCache.setCancellingLocationHere();
        $scope.isReservationAdmin = AuthService.isClubAdmin();
        $scope.busy = true;
        $scope.md = {};

        $scope.rows = [];
        $scope.headers = [];
        $scope.events = [];
        $scope.rowHeight = 30;
        $scope.cellWidth = 10;
        $scope.hoursPerDay = 24;

        function findResourceIndex(reservation) {
            for(let i = 0; i < $scope.md.aircrafts.length; i++) {
                if($scope.md.aircrafts[i].Immatriculation === reservation.Immatriculation) {
                    return i;
                }
            }

            return 0;
        }

        function eventDurationFor(reservation) {
            if (reservation.IsAllDayReservation) {
                return 24;
            }

            let start = moment(reservation.Start);

            return moment.duration(moment(reservation.End).diff(start)).asHours();
        }

        AircraftsOverviews.query().$promise
            .then((result) => {
                $scope.md.aircrafts = result;

                PagedReservations.getReservations({}, {}, 0, 1000)
                    .then((res) => {
                        $scope.now = moment().utc().startOf("day");
                        $scope.calendarStart = $scope.now.clone();

                        $scope.reservations = res;
                        res.Items.forEach(r => {
                            let start = moment(r.Start);
                            let e = {
                                start: start,
                                startCell: moment.duration(start.diff($scope.calendarStart)).asHours(),
                                durationHours: eventDurationFor(r),
                                resourceIndex: findResourceIndex(r),
                                reservation: r
                            };
                            $scope.events.push(e);
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
            });

        $scope.eventAction = (event) => {
            if (event) event.preventDefault();

            if ($scope.drawingEvent) {
                const e = $scope.clearDrawingEvent();
                if (event && e) {
                    $scope.updateDrawingEvent(e, event);
                    $scope.events.push(e);
                }
            } else if (event) {
                // TODO implement adding new event
                /*
                const coordinates = {x: event.offsetX, y: event.offsetY};
                let start = $scope.headers[0].start.clone().add(coordinates.x / $scope.cellWidth, "hours");
                let resourceIndex = Math.floor(coordinates.y / $scope.rowHeight) - 1;
                $scope.drawingEvent = {
                    start: start.clone().minute($scope.floor15(start.minute())).second(0),
                    startCell: moment.duration(start.diff($scope.calendarStart)).asHours(),
                    durationHours: 1,
                    resourceIndex: resourceIndex
                };
                */
            }
        };

        $scope.drawing = (event) => {
            event.preventDefault();

            if ($scope.drawingEvent) {
                $scope.updateDrawingEvent($scope.drawingEvent, event);
            }
        };

        $scope.eventClicked = (event) => {
            $location.path("/reservations/" + event.reservation.AircraftReservationId + "/view");
        };


        $scope.floor15 = (minutes) => {
            return Math.round(minutes / 15) * 15;
        };

        $scope.updateDrawingEvent = (e, event) => {
            const coordinates = {x: event.offsetX, y: event.offsetY};
            let end = $scope.headers[0].start.clone().add(coordinates.x / $scope.cellWidth, "hours");
            let durationHours = Math.round(moment.duration(end.diff(e.start)).asHours() * 4) / 4;
            if (durationHours > 0) {
                e.durationHours = durationHours;
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
