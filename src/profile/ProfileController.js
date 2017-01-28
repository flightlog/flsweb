export default class ProfileController {
    constructor($scope, $window, Countries, AuthService, MessageManager, $http, PersonPersister,
                MemberStates, GLOBALS) {
        $scope.busy = true;
        $scope.masterdata = {};

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
        $http.get(GLOBALS.BASE_URL + '/api/v1/persons/my')
            .then((person) => {
                $scope.person = person.data;
            })
            .then(Countries.query)
            .then((result) => {
                $scope.masterdata.countries = result;
            })
            .then(MemberStates.query)
            .then((result) => {
                $scope.masterdata.memberStates = result;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'own user details'))
            .finally(() => {
                $scope.busy = false;
            });

        $scope.testSpotLink = (SpotLink) => {
            $window.open(SpotLink);
        };
    }
}

