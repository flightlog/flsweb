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
            filterWithStates.AirStates = [];
            filterWithStates.ValidationStates = [];
            filterWithStates.ProcessStates = [];
            filterWithStates.TowFlightAirStates = [];
            filterWithStates.TowFlightValidationStates = [];
            filterWithStates.TowFlightProcessStates = [];

            const NEW = 0;
            const STARTED = 10;
            const LANDED = 20;
            const NOT_VALIDATED = 0;
            const INVALID = 28;
            const VALID = 30;
            const NOT_PROCESSED = 0;
            const LOCKED = 40;
            const DELIVERED = 50;

            if (flightState.glider.ready) {
                filterWithStates.AirStates.push(NEW);
                filterWithStates.ValidationStates.push(NOT_VALIDATED);
                filterWithStates.ProcessStates.push(NOT_PROCESSED);
            }
            if (flightState.glider.inAir) {
                filterWithStates.AirStates.push(STARTED);
            }
            if (flightState.glider.landed) {
                filterWithStates.AirStates.push(LANDED);
            }
            if (flightState.glider.invalid) {
                filterWithStates.ValidationStates.push(INVALID);
                filterWithStates.ProcessStates.push(NOT_PROCESSED);
            }
            if (flightState.glider.locked) {
                filterWithStates.ValidationStates.push(VALID);
                filterWithStates.ProcessStates.push(LOCKED);
            }
            if (flightState.glider.delivered) {
                filterWithStates.ValidationStates.push(VALID);
                filterWithStates.ProcessStates.push(DELIVERED);
            }
            if (flightState.tow.ready) {
                filterWithStates.TowFlightAirStates.push(NEW);
                filterWithStates.TowFlightValidationStates.push(NOT_VALIDATED);
                filterWithStates.TowFlightProcessStates.push(NOT_PROCESSED);
            }
            if (flightState.tow.invalid) {
                filterWithStates.TowFlightValidationStates.push(INVALID);
                filterWithStates.TowFlightProcessStates.push(NOT_PROCESSED);
            }
            if (flightState.tow.locked) {
                filterWithStates.TowFlightValidationStates.push(VALID);
                filterWithStates.TowFlightProcessStates.push(LOCKED);
            }
            if (flightState.tow.delivered) {
                filterWithStates.TowFlightValidationStates.push(VALID);
                filterWithStates.TowFlightProcessStates.push(DELIVERED);
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
            glider: {ready: true, inAir: true, landed: true, invalid: true, locked: true, delivered: true},
            tow: {ready: true, inAir: true, landed: true, invalid: true, locked: true, delivered: true}
        };
    }

    static flightStateSorting(sorting) {
        if (sorting["_flightState"]) {
            let direction = sorting["_flightState"];
            let newSorting = Object.assign({}, sorting, {_flightState: undefined});
            newSorting.AirState = direction;
            newSorting.ValidationState = direction;
            newSorting.ProcessState = direction;

            return newSorting;
        }

        return sorting;
    }

}