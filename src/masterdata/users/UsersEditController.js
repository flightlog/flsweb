import AddPersonController from '../persons/modal/AddPersonController';

export default class UsersEditController {
    constructor($scope, GLOBALS, $q, $location, $routeParams, AuthService, Users, UserRoles, UserService, Persons, Clubs, $modal, PersonPersister, UserPersister, UserAccountStates, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isSystemAdmin = AuthService.hasRole('SystemAdministrator');
        $scope.isClubAdmin = AuthService.hasRole('ClubAdministrator');

        function renderPerson(person, escape) {
            return '<div class="option">' + escape(person.Firstname) + ' ' + escape(person.Lastname) + (person.City ? ' (' + escape(person.City) + ')' : '') + '</div>';
        }

        $scope.renderPerson = {
            option: renderPerson,
            item: renderPerson
        };

        function renderUserAccountState(accountState, escape) {
            return '<div class="option">' + escape(accountState.AccountStateName) + '</div>';
        }

        $scope.renderUserAccountState = {
            option: renderUserAccountState,
            item: renderUserAccountState
        };

        function renderClub(club, escape) {
            return '<div class="option">' + escape(club.ClubName) + '</div>';
        }

        $scope.renderClub = {
            option: renderClub,
            item: renderClub
        };

        const DEFAULT_USER_STATE_ID = '1';

        function loadUser() {
            let deferred = $q.defer();
            if ($routeParams.id === 'new') {
                let user = AuthService.getUser();
                deferred.resolve({
                    ClubId: user.ClubId,
                    AccountState: DEFAULT_USER_STATE_ID,
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return UserPersister.get({id: $routeParams.id}).$promise;
        }

        $scope.newUser = function () {
            $location.path('/masterdata/users/new');
        };
        $scope.editUser = function (user) {
            $location.path('/masterdata/users/' + user.UserId);
        };
        UserAccountStates.query().$promise
            .then((userAccountStates) => {
                $scope.userAccountStates = userAccountStates;
                $scope.filters = {};
                for (let accountState in userAccountStates) {
                    let userAccountState = userAccountStates[accountState];
                    console.log(userAccountState);
                    $scope.filters[userAccountState.UserAccountStateId] = true;
                }
            });

        if ($routeParams.id !== undefined) {
            $q.all([
                    loadUser()
                        .then((user) => {
                            $scope.user = user;
                        }),
                    UserRoles.getAllUserRoles().$promise
                        .then((roles) => {
                            $scope.roles = roles;
                        }),
                    Persons.query().$promise
                        .then((persons) => {
                            $scope.persons = persons;
                        }),
                    Clubs.query().$promise
                        .then((clubs) => {
                            $scope.clubs = clubs;
                        })
                ])
                .finally(function () {
                    $scope.busy = false;
                });
        } else {
            Users.getAllUsers().$promise
                .then(function (result) {
                    $scope.users = result;
                    $scope.busy = false;
                });
        }

        $scope.toggleRoleSelection = (user, RoleId) => {
            if (!user.UserRoleIds) {
                user.UserRoleIds = [];
            }
            var idx = user.UserRoleIds.indexOf(RoleId);
            if (idx > -1) {
                user.UserRoleIds.splice(idx, 1);
            } else {
                user.UserRoleIds.push(RoleId);
            }
        };

        $scope.cancel = function () {
            $location.path('/masterdata/users');
        };
        $scope.save = function (user) {
            $scope.busy = true;
            user.EmailConfirmationLink = AuthService.confirmationLink();
            var p = new UserPersister(user);
            if (user.UserId) {
                p.$saveUser({id: user.UserId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'user'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'user'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.deleteUser = function (user) {
            UserService.delete(user, $scope.users)
                .then(function (res) {
                    $scope.users = res;
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'user'));
        };

        function createModalConfig() {
            return {
                template: require('../persons/modal/add-person.html'),
                controller: AddPersonController,
                resolve: {
                    flags: () => {
                        return {};
                    }
                }
            };
        }

        $scope.newPerson = function () {
            var modalInstance = $modal.open(createModalConfig());

            modalInstance.result.then(function (person) {
                new PersonPersister(person).$save()
                    .then((persistedPerson) => {
                        $scope.persons.push(persistedPerson);
                        $scope.user.PersonId = persistedPerson.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'person'));
            });
        };

        $scope.toggleAccountStateFilter = (id) => {
            $scope.filters[id] = !$scope.filters[id];
        };

    }

}

