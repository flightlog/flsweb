var app = angular.module('fls.planning');

app.factory('PlanningDays', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/overview/future', null, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
});

app.factory('PlanningDayReader', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/:id', null, {
        get: {
            method: 'GET',
            isArray: false
        }
    });
});

app.factory('PlanningDaysUpdater', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/:id', null, {
        saveDay: {
            method: 'POST',
            headers: {
                'X-HTTP-Method-Override': 'PUT'
            }
        },
        $save: {
            method: 'POST'
        }
    });
});

app.factory('PlanningDaysDeleter', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/:id', null, {
        deleteDay: {
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

app.factory('PlanningDaysInserter', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays', null, {
        $save: {
            method: 'POST'
        }
    });
});

app.factory('PlanningDaysRuleBased', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/create/rule', null, {
        runSetup: {
            isArray: true,
            method: 'POST'
        }
    });
});

app.factory('ReservationsByPlanningDay', function ($resource, GLOBALS) {
    return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations/planningday/:id', null, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
});


