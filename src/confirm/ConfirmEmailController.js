import AuthService from '../core/AuthService';
import MessageManager from '../core/MessageManager';

export default class ConfirmEmailController {

    constructor($location, AuthService, MessageManager, $routeParams) {
        this.$location = $location;
        this.AuthService = AuthService;
        this.MessageManager = MessageManager;
        this.success = false;
        if(!$routeParams["emailconfirmed"]) {
            this.confirmEmail($routeParams["userid"], $routeParams["code"]);
        } else {
            this.confirmResult = {
                PasswordResetCode: $routeParams["code"],
                UserId: $routeParams["userid"]
            };
            this.success = true;
        }
    }

    checkMatch() {
        var match = this.newPasswordConfirm == this.newPassword;
        this.choosePasswordForm.newPasswordConfirm.$setValidity("match", match);
        return match;
    }

    choosePassword(newPassword) {
        if(!this.checkMatch()) {
            return false;
        }
        this.MessageManager.reset();
        this.busy = true;
        this.AuthService.resetPassword(this.confirmResult.UserId, this.confirmResult.PasswordResetCode, newPassword)
            .then(() => {
                this.success = true;
                this.AuthService.promptLogin();
                this.$location.path('/dashboard');
            })
            .catch((response) => {
                this.success = false;
                this.busy = false;
                this.MessageManager.raiseError('confirm', 'email', response);
            })
    }

    confirmEmail(userId, code) {
        this.MessageManager.reset();
        this.busy = true;
        this.success = false;
        this.AuthService.confirmEmail(userId, code)
            .then((result) => {
                this.confirmResult = result.data;
                this.success = true;
            })
            .catch((response) => {
                this.success = false;
                this.MessageManager.raiseError('confirm', 'email', response);
            })
            .finally(() => {
                this.busy = false;
            });
    }

}
