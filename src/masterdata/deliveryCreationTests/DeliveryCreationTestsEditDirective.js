import DeliveryCreationTestsEditController from './DeliveryCreationTestsEditController';

export default class DeliveryCreationTestsEditDirective {
    static factory() {
        return {
            template: require("./deliveryCreationTests-table.html"),
            controller: DeliveryCreationTestsEditController
        }
    }
}

