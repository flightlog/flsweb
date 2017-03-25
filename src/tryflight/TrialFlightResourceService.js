export class TrialFlightResourceService {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getAvailableDates() {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/trialflightsregistrations/availabledates/fgzo`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'availabledates list'));
    }

    applyForTrialFlight(trialFlightRegistrationDetails) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/trialflightsregistrations`, trialFlightRegistrationDetails)
            .catch(_.partial(this.MessageManager.raiseError, 'save', 'trialFlightRegistrationDetails'));
    }
}
