import {FlightStateMapper} from "../FlightsServices";

export default class FlightStatusDirective {
    static factory() {
        return {
            template: require("./air-movement-status-icon.html"),
            scope: {
                flight: "="
            },
            controller: ($scope) => {
                let flight = $scope.flight;

                $scope.status = {
                    motor: FlightStateMapper.processedState(flight.ProcessState) || FlightStateMapper.statusOfFlight(flight.AirState)
                }
            }
        }
    }
}

