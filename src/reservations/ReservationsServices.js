/*global _:false*/
'use strict';

var app = angular.module('fls.reservations');

app.factory('Reservations', function ($resource, GLOBALS) {
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
});

app.factory('ReservationTypes', function ($resource, GLOBALS) {
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
});

app.factory('ReservationInserter', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations', null, {
        $save: {
            method: 'POST'
        }
    });
});

app.factory('ReservationUpdater', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations/:id', null, {
        saveReservation: {
            method: 'POST',
            headers: {
                'X-HTTP-Method-Override': 'PUT'
            }
        }
    });
});

app.factory('ReservationService', function (ReservationDeleter, MessageManager) {
    return {
        delete: function (reservation, scope) {
            if (window.confirm('Do you really want to delete this reservation?')) {
                ReservationDeleter.deleteReservation({id: reservation.AircraftReservationId}).$promise
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
});

app.factory('ReservationDeleter', function ($resource, GLOBALS) {
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
});

app.factory('ReservationValidator', function () {
    return {
        calculateInstructorRequired: function (reservationTypes, reservation) {
            var selectedReservationType;
            for (var i = 0; i < reservationTypes.length; i++) {
                if (reservationTypes[i].AircraftReservationTypeId === reservation.ReservationTypeId) {
                    selectedReservationType = reservationTypes[i];
                }
            }
            return selectedReservationType && selectedReservationType.IsInstructorRequired;
        }
    };
});