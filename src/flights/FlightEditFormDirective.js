export default class FlightEditFormDirective {
    static factory() {
        return {
            template: require("./flight-edit-form.html"),
            link: (scope) => {
                scope.gliderImg = require('../images/glider.png');
                scope.towPlaneImg = require('../images/towplane.png');
            }
        }
    }
}

