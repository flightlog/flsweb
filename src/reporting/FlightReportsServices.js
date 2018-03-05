export class FlightReports {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getFlightReports(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/flightreports/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'flightreports list'));
    }
}
