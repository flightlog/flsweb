export default class SimpleSearchBarDirective {
    static factory() {
        return {
            restrict: 'E',
            scope: {
                searchString: '='
            },
            template: require('./simple-search-bar-directive.html')
        };
    }
}