export default class MainController {

    constructor($scope, AuthService) {
        this.cockpitImage = require('../images/cockpit.jpg');
        this.towerImage = require('../images/tower.jpg');
        this.planningImage = require('../images/planning.jpg');
        $scope.getEnabledFeatures = AuthService.getEnabledFeatures;
    }

}
