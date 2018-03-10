export default class PersonsEditController {
    constructor($scope, GLOBALS, $q, $location, $routeParams, NgTableParams, $window, AuthService, PagedPersons, PersonService,
                PersonPersister, MessageManager, Countries, MemberStates, PersonCategoryService) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = false;
        $scope.masterdata = {};
        $scope.isClubAdmin = AuthService.isClubAdmin();
        $scope.requiredFlagsFilterList = [
            'HasGliderInstructorLicence',
            'HasGliderPilotLicence',
            'HasGliderTraineeLicence',
            'HasMotorPilotLicence',
            'HasMotorInstructorLicence',
            'HasTowPilotLicence'
        ];
        $scope.requiredFlagsFilter = {};
        $scope.toggleRequiredFlagFilter = (flag) => {
            let previousValue = $scope.requiredFlagsFilter[flag];
            $scope.requiredFlagsFilter = {};
            $scope.requiredFlagsFilter[flag] = !previousValue;
            $scope.tableParams.reload();
        };
        $scope.resetRequiredFlagsFilters = () => {
            $scope.requiredFlagsFilter = {};
            $scope.tableParams.reload();
        };


        function loadPerson() {
            let deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return PersonPersister.get({id: $routeParams.id}).$promise;
        }

        $scope.newPerson = function () {
            $location.path('/masterdata/persons/new');
        };
        $scope.editPerson = function (person) {
            $location.path('/masterdata/persons/' + person.PersonId);
        };

        if ($routeParams.id !== undefined) {
            $scope.busy = true;
            $q
                .all([
                    Countries.query().$promise.then(function (result) {
                        $scope.masterdata.countries = result;
                    }),
                    MemberStates.query().$promise.then(function (result) {
                        $scope.masterdata.memberStates = result;
                    }),
                    PersonCategoryService.loadPersonCategories().then((result) => {
                        $scope.masterdata.personCategories = result;
                    })
                ])
                .then(loadPerson)
                .then((person) => {
                    $scope.person = person;
                    person.ClubRelatedPersonDetails.PersonCategoryIds.forEach(personCategoryId => {
                        let categoryNode = $scope.masterdata.personCategories.find(category => category.PersonCategoryId === personCategoryId);
                        if(!!categoryNode) {
                            categoryNode.selected = true;
                        }
                    })
                })
                .finally(function () {
                    $scope.busy = false;
                });
        } else {
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    Lastname: 'asc',
                    Firstname: 'asc'
                },
                count: 100
            }, {
                counts: [],
                getData: function (params) {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    let filter = Object.assign({}, $scope.tableParams.filter(), $scope.requiredFlagsFilter);

                    return PagedPersons.getPersons(filter, $scope.tableParams.sorting(), pageStart, pageSize)
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
        }

        $scope.cancel = function () {
            $location.path('/masterdata/persons');
        };

        $scope.save = (person) => {
            $scope.busy = true;
            let ClubRelatedPersonDetails = Object.assign({}, person.ClubRelatedPersonDetails, {PersonCategoryIds: PersonCategoryService.collectSelectedIds($scope.masterdata.personCategories)});

            let p = new PersonPersister(Object.assign({}, person, {ClubRelatedPersonDetails: ClubRelatedPersonDetails}));
            if (person.PersonId) {
                p.$savePerson({id: person.PersonId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'person'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'person'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.deletePerson = function (person) {
            PersonService.delete(person, $scope.persons)
                .then(() => {
                    $scope.tableParams.reload();
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'person'));
        };

        $scope.testSpotLink = (SpotLink) => {
            $window.open(SpotLink);
        };

    }
}

