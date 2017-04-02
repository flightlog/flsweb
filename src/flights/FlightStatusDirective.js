import {FlightStateMapper} from "./FlightsServices";

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

                $scope.status = {
                    glider: FlightStateMapper.processedState(flight.ProcessState) || FlightStateMapper.statusOfFlight(flight.AirState)
                };
                if ($scope.mode !== "MOTOR") {
                    $scope.status.tow = FlightStateMapper.processedState(flight.ProcessState) || flight.TowFlightId && FlightStateMapper.statusOfFlight(flight.TowFlightAirState);
                }
            }
        }
    }
}

