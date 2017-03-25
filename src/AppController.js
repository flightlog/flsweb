export default class AppController {

    constructor($scope, AuthService) {
        $scope.showNavBar = AuthService.showNavBar;
    }

}