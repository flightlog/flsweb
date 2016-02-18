import AuditLogService from "./AuditLogService";

export default class HistoryTableController {
    constructor($scope, $modalInstance, entityName, entityId, AuditLogService, MessageManager) {
        this.entityName = entityName;
        this.busy = true;
        if(entityId) {
            AuditLogService.query({entityName: this.entityName, recordId: entityId}).$promise
                .then((historyEntries) => {
                    $scope.historyEntries = historyEntries;
                })
                .finally(() => {
                    this.busy = false;
                });
        } else {
            MessageManager.displayError("failed to load history (entityId was undefined)");
            this.busy = false;
            this.close();
        }
        this.$modalInstance = $modalInstance;
    }

    close() {
        this.$modalInstance.close();
    }
}