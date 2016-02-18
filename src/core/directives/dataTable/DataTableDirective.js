export default class DataTableDirective {
    static factory() {
        return {
            restrict: 'E',
            transclude: true,
            template: require('./data-table-directive.html'),
            scope: {
                busy: '=',
                onNewClick: '=',
                title: '@'
            }
        };
    }
}
