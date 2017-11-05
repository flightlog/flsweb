export default class PersonCategoriesController {
    constructor($scope, $q, $location, $routeParams, GLOBALS, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = false;


        $scope.expand_collapse = function (data) {
            data.show = !data.show;
        };

        // below is an array of size 1 - it does not have to be that way
        $scope.tree = [{
            name: "Root",
            show: true,
            nodes: []
        }];

        var nodeChild1 = {
            name: "Child 1",
            show: false,
            nodes: []
        };
        var nodeChild2 = {
            name: "Child 2",
            show: false,
            nodes: []
        };
        // Add the children
        $scope.tree[0].nodes.push(nodeChild1);
        $scope.tree[0].nodes.push(nodeChild2);

        var nodeGrandChild1 = {
            name: "Grand Child 1",
            show: false,
            nodes: []
        };
        var nodeGrandChild11 = {
            name: "Grand Child 11",
            show: false,
            nodes: []
        };
        nodeChild1.nodes.push(nodeGrandChild1);
        nodeChild1.nodes.push(nodeGrandChild11);

        var nodeGrandChild2 = {
            name: "Grand Child 2",
            show: false,
            nodes: []
        };
        var nodeGrandChild21 = {
            name: "Grand Child 21",
            show: false,
            nodes: []
        };
        nodeChild2.nodes.push(nodeGrandChild2);
        nodeChild2.nodes.push(nodeGrandChild21);
    }
}
