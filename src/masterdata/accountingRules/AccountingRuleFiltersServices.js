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
            }
        });
    }
}