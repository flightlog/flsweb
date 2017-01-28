export class PagedReservations {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getReservations(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/aircraftreservations/page/${pageStart + 1}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'reservations list'));
    }
}

export class Reservations {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations/:subpath', null, {
            query: {
                method: 'GET',
                isArray: true,
                params: {
                    subpath: 'future'
                }
            },
            get: {
                method: 'GET',
                isArray: false
            }
        });
    }
}

export class ReservationTypes {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservationtypes/:subpath', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: true,
                params: {
                    subpath: 'listitems'
                }
            }
        });
    }
}

export class ReservationInserter {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations', null, {
            $save: {
                method: 'POST'
            }
        });
    }
}

export class ReservationUpdater {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations/:id', null, {
            saveReservation: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            }
        });
    }
}

export class ReservationService {
    constructor(ReservationDeleter, MessageManager) {
        return {
            delete: function (reservation, scope) {
                if (window.confirm('Do you really want to delete this reservation?')) {
                    return ReservationDeleter.deleteReservation({id: reservation.AircraftReservationId}).$promise
                        .then(function () {
                            console.log('successfully removed reservation.');
                            scope.reservations = _.filter(scope.reservations, function (d) {
                                return d !== reservation;
                            });
                        })
                        .catch(_.partial(MessageManager.raiseError, 'delete', 'reservation'));
                }
            }
        };
    }
}

export class ReservationDeleter {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations/:id', null, {
            deleteReservation: {
                method: 'POST',
                params: {
                    id: '@id'
                },
                headers: {
                    'X-HTTP-Method-Override': 'DELETE'
                }
            }
        });
    }
}

export class ReservationValidator {
    constructor() {
        return {
            calculateInstructorRequired: function (reservationTypes, reservation) {
                var selectedReservationType;
                for (var i = 0; i < reservationTypes.length; i++) {
                    if (reservationTypes[i].AircraftReservationTypeId === parseInt(reservation.ReservationTypeId)) {
                        selectedReservationType = reservationTypes[i];
                    }
                }
                return selectedReservationType && selectedReservationType.IsInstructorRequired;
            }
        };
    }
}