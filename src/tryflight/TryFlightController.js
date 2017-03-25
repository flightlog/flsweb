export default class TryflightController {

    constructor(MessageManager, AuthService) {
        this.MessageManager = MessageManager;
        AuthService.setShowNavBar(false);
    }

    tryflight(email) {
        this.MessageManager.reset();
        this.busy = true;
        this.success = false;
        
    }

}
