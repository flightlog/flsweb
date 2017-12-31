import {FlightStateMapper, PROCESS_FIELD} from "../FlightsServices";

export default class FlightStatusDirective {
    static factory() {
        return {
            template: require("./air-movement-status-icon.html"),
            scope: {
                flight: "=",
                field: "@"
            },
            controller: ($scope) => {
                let flight = $scope.flight;
                let field = $scope.field;

                if (field === PROCESS_FIELD) {
                    $scope.status = {
                        motor: FlightStateMapper.processedState(flight.ProcessState)
                    }
                } else {
                    $scope.status = {
                        motor: FlightStateMapper.statusOfFlight(flight.AirState)
                    }
                }
                $scope.status.validationErrors = flight.ValidationErrors;
            }
        }
    }
}

