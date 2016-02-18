import LocationsEditController from './LocationsEditController';

export default class LocationsEditDirective {
    static factory() {
        return {
            template: require("./locations-table.html"),
            controller: LocationsEditController
        }
    }
}

