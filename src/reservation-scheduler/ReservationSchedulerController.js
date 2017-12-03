import moment from "moment";

export default class ReservationSchedulerController {

    constructor($scope, $location, AuthService, ReservationService, PagedReservations, NavigationCache) {
        NavigationCache.setCancellingLocationHere();
        $scope.isReservationAdmin = AuthService.isClubAdmin();
        $scope.busy = false;

        PagedReservations.getReservations({}, {}, 0, 1000)
            .then((res) => {
                $scope.reservations = res;
            });

        $scope.rows = [];
        $scope.headers = [];
        $scope.events = [];
        $scope.rowHeight = 30;
        $scope.cellWidth = 10;
        $scope.hoursPerDay = 24;

        $scope.now = moment(moment().format("YYYY-MM-DD"), "YYYY-MM-DD");
        $scope.calendarStart = $scope.now.clone();
        let headerIdx = 0;
        for (let i = 0; i < 20; i++) {
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
                let hour = {
                    start: $scope.now.clone(),
                    events: []
                };
                $scope.events.forEach(event => {
                    if (hour.start.isAfter(event.start)
                        && hour.start.isBefore(event.start.clone().add(event.durationHours, "hours"))) {
                        hour.events.push(event);
                    }
                });
                $scope.rows[i][j] = hour;
            }
        }

        $scope.eventAction = (event) => {
            if (event) event.preventDefault();

            if ($scope.drawingEvent) {
                const e = $scope.clearDrawingEvent();
                if (event && e) {
                    $scope.updateDrawingEvent(e, event);
                    $scope.events.push(e);
                }
            } else if (event) {
                const coordinates = {x: event.offsetX, y: event.offsetY};
                let start = $scope.headers[0].start.clone().add(coordinates.x / $scope.cellWidth, "hours");
                let resourceIndex = Math.floor(coordinates.y / $scope.rowHeight) - 1;
                $scope.drawingEvent = {
                    start: start.clone().minute($scope.floor15(start.minute())).second(0),
                    startCell: moment.duration(start.diff($scope.calendarStart)).asHours(),
                    durationHours: 1,
                    resourceIndex: resourceIndex
                };
            }
        };

        $scope.drawing = (event) => {
            event.preventDefault();

            if ($scope.drawingEvent) {
                $scope.updateDrawingEvent($scope.drawingEvent, event);
            }
        };

        $scope.eventClicked = (event) => {
            console.log("event", event);
            window.alert("clicked event " + JSON.stringify(event));
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
                $scope.events.push($scope.drawingEvent);
                delete $scope.drawingEvent;
            }

            return e;
        };
    }

}
