import moment from "moment";


export default class PassengerflightController {

    constructor(MessageManager, AuthService, PassengerFlightResourceService, $routeParams, $location, vcRecaptchaService) {
        let clubKey = $routeParams["club"];
        if (!clubKey) {
            $location.path("/main");
        }
        this.MessageManager = MessageManager;
        this.PassengerFlightResourceService = PassengerFlightResourceService;
        this.vcRecaptchaService = vcRecaptchaService;
        AuthService.setShowNavBar(false);
        moment.locale("de");

        this.PassengerFlightRegistrationDetails = {
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
    }

    passengerflight() {
        this.MessageManager.reset();
        this.busy = true;
        this.success = false;
        
        this.PassengerFlightRegistrationDetails.RecaptchaResponse = this.recaptchaResponse;

        console.log(this.PassengerFlightRegistrationDetails);
        this.PassengerFlightResourceService.applyForPassengerFlight(this.PassengerFlightRegistrationDetails)
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
