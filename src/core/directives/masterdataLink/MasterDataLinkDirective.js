export class MasterDataLinkDirective {
    static factory() {
        return {
            restrict: 'E',
            template: require('./masterdata-link-directive.html'),
            scope: {
                idValue: '=',
                masterdataSubPath: '@'
            }
        };
    }
}
