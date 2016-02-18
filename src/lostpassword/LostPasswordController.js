import AuthService from '../core/AuthService';
import MessageManager from '../core/MessageManager';

export default class LostPasswordController {

    constructor(AuthService, MessageManager) {
        this.AuthService = AuthService;
        this.MessageManager = MessageManager;
    }

    lostPassword(usernameOrNotificationEmail) {
        this.MessageManager.reset();
        this.busy = true;
        this.success = false;
        this.AuthService.lostPassword(usernameOrNotificationEmail)
            .then(() => {
                this.success = true;
            })
            .catch((response) => {
                this.success = false;
                this.MessageManager.raiseError('reset', 'password', response);
            })
            .finally(() => {
                this.busy = false;
            });
    }

}
