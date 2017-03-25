export default class FlightStatusDirective {
    static factory() {
        return {
            template: require("./flight-status-icon.html"),
            scope: {
                flight: "="
            },
            controller: ($scope) => {
                let flight = $scope.flight;

                function statusOfFlight(start, landing) {
                    if (start && landing) {
                        return "LANDED";
                    } else if (start) {
                        return "AIRBORN";
                    } else {
                        return "WAITING";
                    }
                }

                function processedState(processState) {
                    if (processState == 40) {
                        return "LOCKED";
                    }
                    if (processState == 50) {
                        return "DELIVERED";
                    }
                }

                $scope.status = {
                    glider: processedState(flight.ProcessState) || statusOfFlight(flight.StartDateTime, flight.LdgDateTime),
                    tow: processedState(flight.ProcessState) || flight.TowFlightId && statusOfFlight(flight.StartDateTime, flight.TowFlightLdgDateTime)
                };
                console.log($scope.status);
            }
        }
    }
}

