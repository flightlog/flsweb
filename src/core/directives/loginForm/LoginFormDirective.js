export default class LoginFormDirective {
    static factory() {
        return {
            restrict: 'E',
            template: require('./login-form-directive.html'),
            scope: {
                showCancelButton: "@"
            },
            controller: LoginFormController
        };
    }
}


class LoginFormController {

    constructor($scope, $location, AuthService, GLOBALS, $attrs) {
        $scope.getEnabledFeatures = AuthService.getEnabledFeatures;
        $scope.baseurl = GLOBALS.BASE_URL;
        $scope.user = {};
        $scope.showCancelButton = !!$attrs.showCancelButton;

        $scope.login = function () {
            $scope.loginBusy = true;
            $scope.loginError = undefined;
            AuthService.login($scope.user.username, $scope.user.password)
                .then(() => {
                    $location.path('/dashboard');
                })
                .catch((reason) => {
                    console.log(JSON.stringify(reason));
                    $scope.loginError = reason.data;
                    $scope.user = {};
                })
                .finally(() => {
                    $scope.loginBusy = false;
                });
        };

        $scope.hideLoginForm = function () {
            AuthService.hideLogin();
        };

        $scope.lostPassword = () => {
            $scope.hideLoginForm();
            $location.path('/lostpassword');
        };

    }
}