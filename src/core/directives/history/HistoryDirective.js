import HistoryTableController from "./HistoryTableController";

export default class HistoryDirective {
    static factory() {
        return {
            restrict: "E",
            scope: {
                entityName: "@",
                entityId: "="
            },
            template: require("./history-directive.html"),
            bindToController: true,
            controllerAs: "ctrl",
            controller: HistoryController
        };
    }
}

class HistoryController {
    constructor($log, $modal, AuditLogService) {
        this.$log = $log;
        this.$modal = $modal;
        this.AuditLogService = AuditLogService;
    }

    showHistory() {
        this.$modal.open({
            template: require('./history-table.html'),
            controller: HistoryTableController,
            bindToController: true,
            controllerAs: "ctrl",
            resolve: {
                entityName: () => {
                    return this.entityName
                },
                entityId: () => {
                    return this.entityId
                }
            }
        });
    }
}