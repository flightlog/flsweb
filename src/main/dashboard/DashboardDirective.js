import DashboardController from './DashboardController';

export default class DashboardDirective {
    static factory() {
        return {
            restrict: 'E',
            template: require('./dashboard.html'),
            bindToController: true,
            controller: DashboardController,
            controllerAs: "ctrl"
        };
    }
}
