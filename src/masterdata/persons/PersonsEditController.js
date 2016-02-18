export default class PersonsEditController {
    constructor($scope, GLOBALS, $q, $location, $routeParams, $window, Persons, PersonService, PersonPersister, MessageManager, Countries) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;

        Countries.query().$promise.then(function (result) {
            $scope.countries = result;
        });

        function loadPerson() {
            var deferred = $q.defer();
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

        if($routeParams.id !== undefined) {
            loadPerson().then(function (person) {
                $scope.person = person;
            }).finally(function () {
                $scope.busy = false;
            });
        } else {
            Persons.getAllPersons().$promise.then(function (result) {
                $scope.persons = result;
                $scope.busy = false;
            });
        }

        $scope.cancel = function () {
            $location.path('/masterdata/persons');
        };
        $scope.save = function (person) {
            $scope.busy = true;
            var p = new PersonPersister(person);
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
                .then(function (res) {
                    $scope.persons = res;
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'person'));
        };

        $scope.testSpotLink = () => {
            $window.open($scope.person.SpotLink);
        };

    }
}

