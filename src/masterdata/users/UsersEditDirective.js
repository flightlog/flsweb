import UsersEditController from './UsersEditController';

export default class UsersEditDirective {
    static factory() {
        return {
            template: require("./users-table.html"),
            controller: UsersEditController
        }
    }
}

