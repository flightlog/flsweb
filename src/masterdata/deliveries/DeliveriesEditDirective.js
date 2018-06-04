import DeliveriesEditController from './DeliveriesEditController';

export default class DeliveriesEditDirective {
    static factory() {
        return {
            template: require("./deliveries-table.html"),
            controller: DeliveriesEditController
        }
    }
}

