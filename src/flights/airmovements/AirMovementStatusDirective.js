export default class FlightStatusDirective {
    static factory() {
        return {
            template: require("./air-movement-status-icon.html"),
            scope: {
                flight: "=",
                type: "="
            },
            controller: ($scope) => {
                var flight = $scope.flight;

                function statusOfFlight(start, landing) {
                    if (start && landing) {
                        return "LANDED";
                    } else if (start) {
                        return "AIRBORN";
                    } else {
                        return "WAITING";
                    }
                }

                $scope.status = {
                    motor: statusOfFlight(flight.StartDateTime, flight.LdgDateTime)
                }
            }
        }
    }
}

