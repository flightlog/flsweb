export class PagedPlanningDays {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getPlanningDays(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/planningdays/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: Object.assign({}, filter, {Day: filter.Day && {Fixed: filter.Day}})
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'planning days list'));
    }
}

export class PlanningDays {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/overview/future', null, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
    }
}

export class PlanningDayReader {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/:id', null, {
            get: {
                method: 'GET',
                isArray: false
            }
        });
    }
}

export class PlanningDaysUpdater {
    constructor($resource, GLOBALS) {
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
    }
}

export class PlanningDaysDeleter {
    constructor($resource, GLOBALS) {
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
    }
}

export class PlanningDaysInserter {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays', null, {
            $save: {
                method: 'POST'
            }
        });
    }
}

export class PlanningDaysRuleBased {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/planningdays/create/rule', null, {
            runSetup: {
                isArray: true,
                method: 'POST'
            }
        });
    }
}

export class ReservationsByPlanningDay {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/aircraftreservations/planningday/:id', null, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
    }
}

