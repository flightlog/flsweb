export default class BusyIndicatorDirective {
    static factory() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                busy: '=',
                error: '='
            },
            template: require('./busy-indicator-directive.html')
        };
    }
}