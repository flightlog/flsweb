export class PagedFlights {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getGliderFlights(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/flights/gliderflights/page/${pageStart + 1}/${pageSize}`, {
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
            .post(`${this.GLOBALS.BASE_URL}/api/v1/flights/motorflights/page/${pageStart + 1}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'flights list'));
    }
}

export class FlightsDateRange {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/flights/gliderflights/daterange/:from/:to', null, {
            getFlights: {
                method: 'GET',
                isArray: true
            }
        });
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
                isArray: true
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
