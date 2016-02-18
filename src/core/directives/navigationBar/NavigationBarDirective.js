export default class NavigationBarDirective {
    static factory() {
        return {
            restrict: 'E',
            template: require('./navigation-bar-directive.html'),
            controller: NavigationBarController
        };
    }
}

class NavigationBarController {

    constructor($rootScope, $scope, $location, AuthService, GLOBALS) {
        $rootScope.$on('$routeChangeError',
            function (/*event, current, previous, rejection*/) {
                $location.path('/main');
            });

        $scope.features = GLOBALS.FEATURES;
        $scope.features.masterdata = isClubAdmin();
        $scope.features.system = isSystemAdmin();
        $scope.baseurl = GLOBALS.BASE_URL;

        //noinspection JSUnresolvedVariable
        $scope.user = DEFAULT_LOGIN;

        $scope.isPath = function (path) {
            return $location.path().indexOf(path) !== -1;
        };

        $scope.login = function () {
            $scope.loginBusy = true;
            $scope.loginError = undefined;
            AuthService.login($scope.user.username, $scope.user.password)
                .then(() => {
                    $scope.user = {
                        username: AuthService.getUser().UserName
                    };
                    $scope.features.masterdata = isClubAdmin();
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

        $scope.logout = function () {
            $scope.loginBusy = false;
            $scope.features.masterdata = false;
            AuthService.logout();
            $location.path('/');
        };

        $scope.isLoggedin = function () {
            return !!AuthService.getUser();
        };

        $scope.showLoginForm = function () {
            AuthService.promptLogin();
        };

        $scope.hideLoginForm = function () {
            AuthService.hideLogin();
        };
        $scope.isLoginFormVisible = function () {
            return AuthService.isLoginFormVisible();
        };
        $scope.lostPassword = () => {
            $scope.hideLoginForm();
            $location.path('/lostpassword');
        };

        function isClubAdmin() {
            return AuthService.hasRole("ClubAdministrator");
        }

        function isSystemAdmin() {
            return AuthService.hasRole("SystemAdministrator");
        }
    }
}