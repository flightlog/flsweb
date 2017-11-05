export default class PersonCategoriesController {
    constructor($scope, $q, $location, $routeParams, GLOBALS, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = false;

        $scope.toggleSelection = function (branch) {
            branch.Selected = !branch.Selected;
        };

        $scope.tree_data = [
            {
                Name: "USA", Selected: true,
                children: [
                    {
                        Name: "California", Selected: true,
                        children: [
                            {Name: "San Francisco", Selected: false},
                            {Name: "Los Angeles", Selected: false}
                        ]
                    },
                    {
                        Name: "Illinois", Selected: false,
                        children: [
                            {Name: "Chicago", Selected: false}
                        ]
                    }
                ]
            },
            {Name: "Texas", Selected: false}
        ];
        $scope.col_defs = [
            {
                field: "Selected",
                displayName: "Selected",
                cellTemplate: "<span ng-click='cellTemplateScope.click(row.branch)' ng-class='cellTemplateScope.classObj(row, col)' class='clickable'></span>",
                cellTemplateScope: {
                    click: function (branch) {
                        $scope.toggleSelection(branch);
                    },
                    classObj: function (row, col) {
                        return {'fa fa-square-o': row.branch[col.field], 'fa fa-check-square-o': !row.branch[col.field]}
                    }
                }
            }
        ];
    }
}
