import MemberStatesEditController from './MemberStatesEditController';

export default class MemberStatesEditDirective {
    static factory() {
        return {
            template: require("./member-states-table.html"),
            controller: MemberStatesEditController
        }
    }
}

