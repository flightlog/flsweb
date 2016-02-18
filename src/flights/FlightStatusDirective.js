export default class FlightStatusDirective {
    static factory() {
        return {
            template: require("./flight-status-icon.html"),
            scope: {
                flight: "="
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
                    glider: statusOfFlight(flight.StartDateTime, flight.LdgDateTime),
                    tow: flight.TowFlightId && statusOfFlight(flight.StartDateTime, flight.TowFlightLdgDateTime)
                };
            }
        }
    }
}

