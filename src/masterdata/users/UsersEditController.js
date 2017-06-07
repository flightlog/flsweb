import AddPersonController from "../persons/modal/AddPersonController";

export default class UsersEditController {
    constructor($scope, GLOBALS, $q, $location, $routeParams, AuthService, NgTableParams, PagedUsers, UserRoles, UserService, Persons,
                Clubs, $modal, PersonPersister, UserPersister, UserAccountStates, MessageManager, DropdownItemsRenderService) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.md = {};
        $scope.isSystemAdmin = AuthService.hasRole('SystemAdministrator');
        $scope.isClubAdmin = AuthService.hasRole('ClubAdministrator');

        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderUserAccountState = DropdownItemsRenderService.userAccountStateRenderer();
        $scope.renderClub = DropdownItemsRenderService.clubRenderer();

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

        if ($routeParams.id !== undefined) {
            $scope.busy = true;
            $q
                .all([
                    UserRoles.getAllUserRoles().$promise.then((roles) => {
                        $scope.md.roles = roles;
                    }),
                    Persons.query().$promise.then((persons) => {
                        $scope.md.persons = persons;
                    }),
                    Clubs.query().$promise.then((clubs) => {
                        $scope.md.clubs = clubs;
                    }),
                    UserAccountStates.query().$promise.then((userAccountStates) => {
                        $scope.md.userAccountStates = userAccountStates;
                    })
                ])
                .then(loadUser)
                .then((user) => {
                    $scope.user = user;
                })
                .finally(() => {
                    $scope.busy = false;
                });
        } else {
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    UserName: 'asc'
                },
                count: 100
            }, {
                counts: [],
                getData: function (params) {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    let filter = Object.assign({}, $scope.tableParams.filter(), $scope.md.userAccountStates);

                    return PagedUsers.getUsers(filter, $scope.tableParams.sorting(), pageStart, pageSize)
                        .then((result) => {
                            $scope.busy = false;
                            params.total(result.TotalRows);

                            return result.Items;
                        })
                        .finally(() => {
                            $scope.busy = false;
                        });
                }
            });

            UserAccountStates.query().$promise
                .then((userAccountStates) => {
                    $scope.tableParams.userAccountStates = userAccountStates;
                });
        }

        $scope.toggleRoleSelection = (user, RoleId) => {
            if (!user.UserRoleIds) {
                user.UserRoleIds = [];
            }
            let idx = user.UserRoleIds.indexOf(RoleId);
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
            let p = new UserPersister(user);
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
            let modalInstance = $modal.open(createModalConfig());

            modalInstance.result.then(function (person) {
                new PersonPersister(person).$save()
                    .then((persistedPerson) => {
                        $scope.persons.push(persistedPerson);
                        $scope.user.PersonId = persistedPerson.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'person'));
            });
        };

        $scope.resendEmailToken = (user) => {
            $scope.busy = true;
            PagedUsers.resendEmailToken(user)
                .finally(() => {
                    $scope.busy = false;
                })
        };
    }

}

