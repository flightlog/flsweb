import moment from "moment";


export default class TryflightController {

    constructor(MessageManager, AuthService, TrialFlightResourceService, $routeParams, $location, vcRecaptchaService) {
        let clubKey = $routeParams["club"];
        if (!clubKey) {
            $location.path("/main");
        }
        this.MessageManager = MessageManager;
        this.TrialFlightResourceService = TrialFlightResourceService;
        this.vcRecaptchaService = vcRecaptchaService;
        AuthService.setShowNavBar(false);
        moment.locale("de");

        this.TrialFlightRegistrationDetails = {
            ClubKey: clubKey,
            InvoiceAddressIsSame: true,
            SendCouponToInvoiceAddress: true
        };

        this.recaptcha = {
            key: '6LfOUhoUAAAAAG-rfN1dpbTg-K0WXu6jeW0QLjIh',
            setResponse: (response) => {
                console.info('Response available', response);
                this.recaptchaResponse = response;
            },
            setWidgetId: (widgetId) => {
                console.info('Created widget ID: %s', widgetId);
                this.widgetId = widgetId;
            },
            cbExpiration: () => {
                console.info('Captcha expired. Resetting response object');
                vcRecaptchaService.reload(this.widgetId);
                this.recaptchaResponse = null;
            }
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
        this.TrialFlightRegistrationDetails.RecaptchaResponse = this.recaptchaResponse;

        console.log(this.TrialFlightRegistrationDetails);
        this.TrialFlightResourceService.applyForTrialFlight(this.TrialFlightRegistrationDetails)
            .then(() => {
                this.success = true;
                this.busy = false;
            })
            .catch(() => {
                this.success = false;
                this.busy = false;
                this.vcRecaptchaService.reload(this.widgetId);
            });
    }

}
