import {DashboardService, DashboardDataModelAdapter} from "./DashboardServices";

export default class DashboardController {
    constructor(dashboardService, AuthService, MessageManager, $translate, dashboardDataModelAdapter) {
        this.busy = true;
        this.dashboardService = dashboardService;
        this.showStatistics = false;

        this.user = AuthService.getUser();
        if (this.user.PersonId) {
            this.showStatistics = true;
            this.dashboardService.query().$promise
                .then((result) => {
                    this.dashboardData = result;
                    this.myDashboardConfig = dashboardDataModelAdapter.compileMyDashboardConfig(this.dashboardData);
                })
                .finally(() => {
                    this.busy = false;
                });
        } else {
            this.error = "No Person";
            $translate("ERROR_NO_CORRESPONDING_PERSON", {user: this.user.FriendlyName}).then((message) => {
                MessageManager.showMessage(message);
            });
            this.showStatistics = false;
            this.busy = false;
        }

        this.gliderImg = require('../../images/glider.png');
        this.towPlaneImg = require('../../images/towplane.png');
    }

}
