export default class FlightStatusDirective {
    static factory() {
        return {
            template: require("./flight-status-icon.html"),
            scope: {
                flight: "=",
                mode: "="
            },
            controller: ($scope) => {
                let flight = $scope.flight;

                function processedState(processState) {
                    if (processState == 28) {
                        return "VALIDATION_FAILED";
                    }
					if (processState == 30) {
                        return "VALIDATION_OK";
                    }
					if (processState == 40) {
                        return "LOCKED";
                    }
                    if (processState == 50) {
                        return "DELIVERED";
                    }
                }

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
                    glider: processedState(flight.ProcessState) || statusOfFlight(flight.StartDateTime, flight.LdgDateTime)
                };
                if($scope.mode !== "MOTOR") {
                    $scope.status.tow = processedState(flight.ProcessState) || flight.TowFlightId && statusOfFlight(flight.StartDateTime, flight.TowFlightLdgDateTime);
                }
            }
        }
    }
}

