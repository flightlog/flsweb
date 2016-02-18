export default class LogsController {
    constructor($scope, GLOBALS, Logs, MessageManager) {
        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;

        Logs.query().$promise.then((logs) => {
                $scope.logs = logs;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'systemlogs'))
            .finally(() => {
                $scope.busy = false;
            });
    }
}
