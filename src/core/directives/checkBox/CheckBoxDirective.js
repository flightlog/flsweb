export default class CheckBoxDirective {
    static factory() {
        return {
            restrict: 'E',
            template: require('./check-box-directive.html'),
            scope: {
                isChecked: '='
            }
        };
    }
}
