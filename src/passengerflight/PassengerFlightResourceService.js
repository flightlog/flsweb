export class PassengerFlightResourceService {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }
    
    applyForPassengerFlight(passengerFlightRegistrationDetails) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/passengerflightsregistrations`, passengerFlightRegistrationDetails)
            .catch(_.partial(this.MessageManager.raiseError, 'save', 'passengerFlightRegistrationDetails'));
    }
}
