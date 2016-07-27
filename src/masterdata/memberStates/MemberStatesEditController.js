export default class MemberStatesEditController {
    constructor($scope, $q, $location, $routeParams, GLOBALS, MemberStates, MemberStateService, MemberState, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;

        function loadMemberState() {
            var deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return MemberState.get({id: $routeParams.id}).$promise;
        }

        $scope.cancel = function () {
            $location.path('/masterdata/memberStates');
        };
        $scope.save = function (memberState) {
            $scope.busy = true;
            var p = new MemberState(memberState);
            if (memberState.MemberStateId) {
                p.$saveMemberState({id: memberState.MemberStateId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'member state'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'member state'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };


        if ($routeParams.id !== undefined) {
            loadMemberState()
                .then(function (memberState) {
                    $scope.memberState = memberState;
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'member state'))
                .finally(() => {
                    $scope.busy = false;
                });
        } else {
            MemberStates.query().$promise
                .then((result) => {
                    $scope.memberStates = result;
                })
                .finally(() => {
                    $scope.busy = false;
                });
        }

        $scope.newMemberState = function () {
            $location.path('/masterdata/memberStates/new');
        };

        $scope.editMemberState = function (memberState) {
            $location.path('/masterdata/memberStates/' + memberState.MemberStateId);
        };

        $scope.deleteMemberState = function (memberState) {
            MemberStateService.delete(memberState, $scope.memberStates)
                .then(function (res) {
                    $scope.memberStates = res;
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'member state'));
        };

    }
}
