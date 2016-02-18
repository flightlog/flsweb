export default class FlightTypesEditController {
    constructor($scope, $q, $location, $routeParams, GLOBALS, FlightTypes, FlightTypeService, FlightType, MessageManager, StringUtils) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;

        $scope.comparator = function (actual, expected) {
            if (!expected) {
                return true;
            }
            return StringUtils.contains(actual.FlightCode, expected)
                || StringUtils.contains(actual.FlightTypeName, expected);
        };

        function loadFlightType() {
            var deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return FlightType.get({id: $routeParams.id}).$promise;
        }

        $scope.cancel = function () {
            $location.path('/masterdata/flightTypes');
        };
        $scope.save = function (flightType) {
            $scope.busy = true;
            var p = new FlightType(flightType);
            if (flightType.FlightTypeId) {
                p.$saveFlightType({id: flightType.FlightTypeId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'flight type'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'flight type'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };


        if ($routeParams.id !== undefined) {
            loadFlightType()
                .then(function (flightType) {
                    $scope.flightType = flightType;
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'flight type'))
                .finally(() => {
                    $scope.busy = false;
                });
        } else {
            FlightTypes.query().$promise
                .then((result) => {
                    $scope.flightTypes = result;
                })
                .finally(() => {
                    $scope.busy = false;
                });
        }

        $scope.newFlightType = function () {
            $location.path('/masterdata/flightTypes/new');
        };

        $scope.editFlightType = function (flightType) {
            $location.path('/masterdata/flightTypes/' + flightType.FlightTypeId);
        };

        $scope.deleteFlightType = function (flightType) {
            FlightTypeService.delete(flightType, $scope.flightTypes)
                .then(function (res) {
                    $scope.flightTypes = res;
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'flight type'));
        };

    }
}
