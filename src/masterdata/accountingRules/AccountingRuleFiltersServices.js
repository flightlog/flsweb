export class PagedAccountingRuleFilters {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getAccountingRuleFilters(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/accountingrulefilters/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'accountingRuleFilters list'));
    }

    getAccountingRuleFilter(accountingRuleFilterId) {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/accountingrulefilters/${accountingRuleFilterId}`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'accountingRuleFilter'));
    }
}

export class AccountingUnitTypesService {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getAccountingUnitTypes() {
        return this.$http.get(`${this.GLOBALS.BASE_URL}/api/v1/accountingunittypes`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'accountingUnitTypes'));
    }
}

export class AccountingRuleFilterTypesService {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getAccountingRuleFilterTypes() {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/accountingrulefiltertypes`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'accountingRuleFilterTypes list'));
    }
}

export class FlightCrewTypesService {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getFlightCrewTypes() {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/flightcrewtypes/listitems`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'flightCrewTypes list'));
    }
}

export class AccountingRuleFilter {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/accountingrulefilters/:id', null, {
            saveAccountingRuleFilter: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
            },
            delete: {
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

export class AccountingRuleFilterService {
    constructor($q, AccountingRuleFilter) {
        return {
            delete: function (accountingRuleFilter, accountingRuleFilters) {
                var deferred = $q.defer();
                if (window.confirm('Do you really want to remove this accountingRuleFilter from the database?')) {
                    AccountingRuleFilter.delete({id: accountingRuleFilter.AccountingRuleFilterId}).$promise
                        .then(function () {
                            accountingRuleFilters = _.filter(accountingRuleFilters, function (d) {
                                return d.AccountingRuleFilterId !== accountingRuleFilter.AccountingRuleFilterId;
                            });
                            deferred.resolve(accountingRuleFilters);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(accountingRuleFilters);
                return deferred.promise;
            }
        };
    }
}