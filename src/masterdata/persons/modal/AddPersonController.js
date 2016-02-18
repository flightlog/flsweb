export default class AddPersonController {
    constructor(GLOBALS, $scope, $modalInstance, flags, Countries) {
        $scope.debug = GLOBALS.DEBUG;

        Countries.query().$promise.then(function (result) {
            $scope.countries = result;
        });

        $scope.person = {
            HasGliderPilotLicence: flags.GliderPilot,
            HasTowPilotLicence: flags.TowingPilot,
            HasMotorPilotLicence: flags.TowingPilot,
            ClubRelatedPersonDetails: {}
        };
        $scope.flags = flags;

        $scope.ok = function (person) {
            $modalInstance.close(person);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
}
