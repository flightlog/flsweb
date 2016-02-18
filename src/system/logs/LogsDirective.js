import LogsController from './LogsController';

export default class LogsDirective {
    static factory() {
        return {
            template: require("./logs-table.html"),
            controller: LogsController,
            bindToController: true,
            controllerAs: "ctrl"
        }
    }
}

