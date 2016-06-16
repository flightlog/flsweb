export default class ProfileController {
    constructor($scope, $window, Persons, Countries, AuthService, MessageManager, $http, PersonPersister, TimeService, GLOBALS) {
        $scope.busy = true;

        $scope.updatePassword = function (user, OldPassword, NewPassword) {
            MessageManager.reset();
            $scope.busy = true;
            $http.put(GLOBALS.BASE_URL + '/api/v1/users/changepassword', {
                    UserId: user.UserId,
                    OldPassword: OldPassword,
                    NewPassword: NewPassword
                })
                .then(function () {
                    MessageManager.showMessage('password changed successfully');
                })
                .catch(_.partial(MessageManager.raiseError, 'change', 'password'))
                .finally(function () {
                    $scope.busy = false;
                });
        };

        $scope.save = function (person) {
            MessageManager.reset();
            $scope.busy = true;
            person.MedicalClass1ExpireDate = TimeService.removeTimeOffset(person.MedicalClass1ExpireDate);
            person.MedicalClass2ExpireDate = TimeService.removeTimeOffset(person.MedicalClass2ExpireDate);
            person.MedicalLaplExpireDate = TimeService.removeTimeOffset(person.MedicalLaplExpireDate);
            person.GliderInstructorLicenceExpireDate = TimeService.removeTimeOffset(person.GliderInstructorLicenceExpireDate);


            var p = new PersonPersister(person);
            if (person.PersonId) {
                p.$savePerson({id: person.PersonId})
                    .then(function () {
                        MessageManager.showMessage('successfully saved person details for ' + person.Firstname);
                    })
                    .catch(_.partial(MessageManager.raiseError, 'update', 'own person'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.myUser = AuthService.getUser();
        Persons.getMyPerson().$promise
            .then(function (person) {
                $scope.person = person;
            })
            .then(Countries.query)
            .then(function (result) {
                $scope.countries = result;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'own user details'))
            .finally(function () {
                $scope.busy = false;
            });

        $scope.testSpotLink = (SpotLink) => {
            $window.open(SpotLink);
        };
    }
}

