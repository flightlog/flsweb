export default class LabelledCheckBoxDirective {
    static factory() {
        return {
            restrict: 'E',
            template: require('./labelled-check-box-directive.html'),
            scope: {
                entity: '=',
                ngDisabled: '=',
                attribute: '@',
                translationKey: '@'
            }
        };
    }
}
