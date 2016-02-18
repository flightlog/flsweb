import ClubsEditController from './ClubsEditController';

export default class ClubsEditDirective {
    static factory() {
        return {
            template: require("./clubs-table.html"),
            controller: ClubsEditController
        }
    }
}

