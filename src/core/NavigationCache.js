export default class NavigationCache {
    constructor($location) {
        var srv = {
            setCancellingLocationHere: function () {
                srv.cancellingLocation = $location.path();
            }
        };
        return srv;
    }
}
