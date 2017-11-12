import * as _ from "lodash";

export default class PersonCategoriesController {
    constructor($scope, $route, $http, GLOBALS, MessageManager, PersonCategoryService) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.editMode = false;
        $scope.data = {nodes: []};

        PersonCategoryService.loadPersonCategories()
            .then((result) => {
                $scope.data.nodes = result;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'person categories list'))
            .finally(function () {
                $scope.busy = false;
            });

        $scope.addNode = function (parent) {
            let newName = window.prompt("Person-Category Name:");

            if(newName) {
                let newNode = {
                    CategoryName: newName,
                    ParentPersonCategoryId: parent && parent.PersonCategoryId
                };

                $http.post(GLOBALS.BASE_URL + '/api/v1/personCategories', newNode)
                    .then(function () {
                        $route.reload();
                    })
                    .catch(_.partial(MessageManager.raiseError, 'add', 'person category'));
            }
        };

        $scope.editNode = function (node) {
            let CategoryName = window.prompt("Person-Category Name:", node.CategoryName);

            if (CategoryName) {
                $http.post(GLOBALS.BASE_URL + '/api/v1/personCategories/' + node.PersonCategoryId, Object.assign({}, node, {
                    CategoryName: CategoryName,
                    children: undefined,
                    level: undefined
                }), {
                    headers: {
                        'X-HTTP-Method-Override': 'PUT'
                    }
                })
                    .then(function () {
                        $route.reload();
                    })
                    .catch(_.partial(MessageManager.raiseError, 'update', 'person category'));
            }
        };

        $scope.deleteNode = function (node) {
            if (window.confirm("Really delete '" + node.CategoryName + "'?")) {
                $http.post(GLOBALS.BASE_URL + '/api/v1/personCategories/' + node.PersonCategoryId, {}, {
                    headers: {
                        'X-HTTP-Method-Override': 'DELETE'
                    }
                })
                    .then(function () {
                        $route.reload();
                    })
                    .catch(_.partial(MessageManager.raiseError, 'delete', 'person category'));
            }
        };
    }
}
