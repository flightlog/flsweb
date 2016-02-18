import FlightTypesEditController from './FlightTypesEditController';

export default class FlightTypesEditDirective {
    static factory() {
        return {
            template: require("./flight-types-table.html"),
            controller: FlightTypesEditController
        }
    }
}

