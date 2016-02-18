import PersonsEditController from './PersonsEditController';

export default class PersonsEditDirective {
    static factory() {
        return {
            template: require("./persons-table.html"),
            controller: PersonsEditController
        }
    }
}

