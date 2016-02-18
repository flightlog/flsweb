import angular from 'angular';
import angularMessages from 'angular-messages';
import coreModule from '../core/CoreModule';
import ConfirmEmailController from './ConfirmEmailController';

export default angular.module('fls.confirm.email', [
        coreModule.name,
        angularMessages
    ])
    .controller('ConfirmEmailController', ConfirmEmailController)
    .config(($routeProvider) => {
        $routeProvider
            .when('/confirm',
                {
                    bindToController: true,
                    controllerAs: 'ctrl',
                    controller: ConfirmEmailController,
                    template: require('./confirm-email.html'),
                    publicAccess: true
                });
    });
