import moment from "moment";


export default class TryflightController {

    constructor(MessageManager, AuthService, TrialFlightResourceService, $routeParams) {
        let clubKey = $routeParams["club"];
        this.MessageManager = MessageManager;
        this.TrialFlightResourceService = TrialFlightResourceService;
        AuthService.setShowNavBar(false);
        moment.locale("de");

        this.TrialFlightRegistrationDetails = {
            ClubKey: clubKey,
            InvoiceAddressIsSame: true
        };

        function formattedDate(d) {
            let m = moment(d);

            return {
                date: d,
                formatted: m.format("dddd, DD.MM.YYYY")
            };
        }

        this.TrialFlightResourceService.getAvailableDates().then(dates => {
            this.choice = {
                tryFlightDays: dates.map(date => formattedDate(date))
            };
            this.selectedDay = this.choice.tryFlightDays && this.choice.tryFlightDays[0];
        });
    }

    tryflight() {
        this.MessageManager.reset();
        this.busy = true;
        this.success = false;

        this.TrialFlightRegistrationDetails.SelectedDay = this.selectedDay && this.selectedDay.date;
        console.log(this.TrialFlightRegistrationDetails);
        this.TrialFlightResourceService.applyForTrialFlight(this.TrialFlightRegistrationDetails)
            .then(() => {
                this.success = true;
                this.busy = false;
            })
            .catch(() => {
                this.success = false;
                this.busy = false;
            });
    }

}
