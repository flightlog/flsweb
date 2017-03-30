export class PagedFlights {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getGliderFlights(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/flights/gliderflights/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'flights list'));
    }

    getMotorFlights(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/flights/motorflights/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'flights list'));
    }
}

export class Flights {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/flights/:id', null, {
            getFlights: {
                method: 'GET',
                isArray: true,
                params: {
                    id: 'overview'
                }
            },
            getFlight: {
                method: 'GET',
                isArray: false
            },
            saveFlight: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
            },
            deleteFlight: {
                method: 'DELETE'
            }
        });
    }
}

export class FlightCostBalanceTypes {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/flightcostbalancetypes', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: true
            }
        });
    }
}

export class SoloFlightCheckboxEnablementCalculator {
    constructor() {
        return {
            getSoloFlightCheckbox: function (flightType, gliderFlightDetails) {
                var state = 'UNDEFINED';
                if (flightType && flightType.IsSoloFlight) {
                    state = 'CHECKED';
                    gliderFlightDetails.IsSoloFlight = true;
                } else if (flightType && flightType.IsPassengerFlight) {
                    state = 'UNCHECKED';
                    gliderFlightDetails.IsSoloFlight = false;
                } else if (gliderFlightDetails.IsSoloFlight) {
                    state = 'CHECKED';
                } else if (gliderFlightDetails.IsSoloFlight === false) {
                    state = 'UNCHECKED';
                }
                return {
                    state: state,
                    isChangingAllowed: !flightType || (!flightType.IsSoloFlight && !flightType.IsPassengerFlight)
                };
            }
        };
    }
}

export class FlightStateMapper {
    static mapFlightState(filter) {
        let filterWithStates = Object.assign({}, filter);
        let flightState = filterWithStates._flightState || Object.assign({}, FlightStateMapper.allFlightStates());

        if (FlightStateMapper.anyStateDisabled(flightState.glider) || FlightStateMapper.anyStateDisabled(flightState.tow)) {
            filterWithStates._flightState = undefined;

            filterWithStates.AirStates = [];
            filterWithStates.ValidationStates = [];
            filterWithStates.ProcessStates = [];
            filterWithStates.TowFlightAirStates = [];
            filterWithStates.TowFlightValidationStates = [];
            filterWithStates.TowFlightProcessStates = [];

            if (flightState.glider.ready) {
                filterWithStates.AirStates.push(0);
            }
            if (flightState.glider.inAir) {
                filterWithStates.AirStates.push(10);
            }
            if (flightState.glider.landed) {
                filterWithStates.AirStates.push(20);
            }
            if (flightState.glider.locked) {
                filterWithStates.ValidationStates = [0, 28, 30];
                filterWithStates.ProcessStates = [0, 40, 50];
            }
            if (flightState.tow.ready) {
                filterWithStates.TowFlightAirStates.push(0);
            }
            if (flightState.tow.inAir) {
                filterWithStates.TowFlightAirStates.push(10);
            }
            if (flightState.tow.landed) {
                filterWithStates.TowFlightAirStates.push(20);
            }
            if (flightState.tow.locked) {
                filterWithStates.TowFlightValidationStates = [0, 28, 30];
                filterWithStates.TowFlightProcessStates = [0, 40, 50];
            }

            return filterWithStates;
        } else {
            return filter;
        }
    }

    static anyStateDisabled(stateObject) {
        for (let key in stateObject) {
            if (stateObject.hasOwnProperty(key) && !stateObject[key]) {
                return true;
            }
        }
        return false;
    }

    static allFlightStates() {
        return {
            glider: {ready: true, inAir: true, landed: true, locked: true},
            tow: {ready: true, inAir: true, landed: true, locked: true}
        };
    }

    static flightStateSorting(sorting) {
        if (sorting["_flightState"]) {
            let newSorting = Object.assign({}, sorting, {_flightState: undefined});
            newSorting.AirState = "asc";
            newSorting.ValidationState = "asc";
            newSorting.ProcessingState = "asc";

            return newSorting;
        }

        return sorting;
    }

}