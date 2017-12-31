import {FlightStateMapper, PROCESS_FIELD} from "./FlightsServices";

export default class FlightStatusDirective {
    static factory() {
        return {
            template: require("./flight-status-icon.html"),
            scope: {
                flight: "=",
                field: "@"
            },
            controller: ($scope) => {
                let flight = $scope.flight;
                let field = $scope.field;

                if (field === PROCESS_FIELD) {
                    $scope.status = {
                        glider: FlightStateMapper.processedState(flight.ProcessState),
                        tow: FlightStateMapper.processedState(flight.TowFlightProcessState)
                    };
                } else {
                    $scope.status = {
                        glider: FlightStateMapper.statusOfFlight(flight.AirState),
                        tow: flight.TowFlightId && FlightStateMapper.statusOfFlight(flight.TowFlightAirState)
                    };
                }
                $scope.status.validationErrors = flight.ValidationErrors;
            }
        }
    }
}

