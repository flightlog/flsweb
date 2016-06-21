export default class AddPersonController {
    constructor(GLOBALS, $scope, $modalInstance, flags, Countries) {
        $scope.debug = GLOBALS.DEBUG;

        Countries.query().$promise.then(function (result) {
            $scope.countries = result;
            $scope.masterdata = {
                countries: result
            };
        });

        $scope.person = {
            HasGliderPilotLicence: flags.GliderPilot,
            HasGliderPassengerLicence: flags.Passenger,
            HasTowPilotLicence: flags.TowingPilot,
            HasMotorPilotLicence: flags.TowingPilot,
            ClubRelatedPersonDetails: {
                IsGliderPilot: flags.GliderPilot,
                IsPassenger: flags.Passenger,
                IsTowPilot: flags.TowingPilot,
                IsMotorPilot: flags.TowingPilot
            }
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
