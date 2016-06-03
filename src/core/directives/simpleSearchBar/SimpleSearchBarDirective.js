export default class SimpleSearchBarDirective {
    static factory() {
        return {
            restrict: 'E',
            scope: {
                searchString: '='
            },
            template: require('./simple-search-bar-directive.html'),
            link: (scope) => {
                scope.resetSearch = (newSearchString) => {
                    scope.searchString = newSearchString;
                }
            }
        };
    }
}