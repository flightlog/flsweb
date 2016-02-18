import AircraftsEditController from './AircraftsEditController';

export default class AircraftsEditDirective {
    static factory() {
        return {
            template: require("./aircrafts-table.html"),
            controller: AircraftsEditController
        }
    }
}

