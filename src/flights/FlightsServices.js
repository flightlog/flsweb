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

export const NEW = 0;
export const OPENED = 5;
export const STARTED = 10;
export const LANDED = 20;
export const CLOSED = 25;

export const NOT_PROCESSED = 0;
export const INVALID = 28;
export const VALID = 30;
export const LOCKED = 40;
export const DELIVERED = 50;

export class FlightStateMapper {

    static mapFlightState(filter) {
        let filterWithStates = Object.assign({}, filter);
        let flightState = filterWithStates._flightState || Object.assign({}, FlightStateMapper.allFlightStates());

        if (FlightStateMapper.anyStateDisabled(flightState.flight)) {
            filterWithStates.AirStates = [];
            filterWithStates.ProcessStates = [];

            filterWithStates.AirStates.push(OPENED);
            filterWithStates.AirStates.push(CLOSED);
            if (flightState.flight.ready) {
                filterWithStates.AirStates.push(NEW);
            }

            filterWithStates.ProcessStates.push(NOT_PROCESSED);
            if (flightState.flight.inAir) {
                filterWithStates.AirStates.push(STARTED);
            }
            if (flightState.flight.landed) {
                filterWithStates.AirStates.push(LANDED);
            }
            if (flightState.flight.invalid) {
                filterWithStates.ProcessStates.push(INVALID);
            }
            if (flightState.flight.valid) {
                filterWithStates.ProcessStates.push(VALID);
            }
            if (flightState.flight.locked) {
                filterWithStates.ProcessStates.push(LOCKED);
            }
            if (flightState.flight.delivered) {
                filterWithStates.ProcessStates.push(DELIVERED);
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
            flight: {ready: true, inAir: true, landed: true, valid: true, invalid: true, locked: true, delivered: true}
        };
    }

    static flightStateSorting(sorting) {
        if (sorting["_flightState"]) {
            let direction = sorting["_flightState"];
            let newSorting = Object.assign({}, sorting, {_flightState: undefined});
            newSorting.AirState = direction;
            newSorting.ProcessState = direction;

            return newSorting;
        }

        return sorting;
    }


    static processedState(processState) {
        switch (processState) {
            case NOT_PROCESSED:
                return;
            case VALID:
                return "VALIDATION_OK";
            case INVALID:
                return "VALIDATION_FAILED";
            case LOCKED:
                return "LOCKED";
            case DELIVERED:
                return "DELIVERED";
            default:
                return;
        }
    }

    static statusOfFlight(airState) {
        switch (airState) {
            case NEW:
                return "WAITING";
            case STARTED:
                return "AIRBORN";
            case LANDED:
                return "LANDED";
            default:
                return;
        }
    }

}