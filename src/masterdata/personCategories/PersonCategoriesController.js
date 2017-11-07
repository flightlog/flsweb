import * as _ from "lodash";

export default class PersonCategoriesController {
    constructor($scope, $q, $route, $http, GLOBALS, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.nodes = [];
        $scope.editMode = false;


        function collectNodes(nodeArray) {
            for (let i = 0; nodeArray && i < nodeArray.length; i++) {
                let node = nodeArray[i];
                $scope.nodes.push(node);
                collectNodes(node.children);
            }
        }

        $scope.toggleChildren = function (node) {
            node.children.forEach(function(child) {
                child.selected = node.selected;
            });
        };

        $http.get(GLOBALS.BASE_URL + '/api/v1/personCategories')
            .then(function (result) {
                let treeData = result.data;
                let idToNodeMap = {};
                let nodes = [];
                let rootNodes = [];

                treeData.forEach(function (node) {
                    node.children = [];
                    nodes.push(node);
                    idToNodeMap[node.PersonCategoryId] = node;
                });

                nodes.forEach(function (node) {
                    if (typeof node.ParentPersonCategoryId === "undefined") {
                        node.level = 0;
                        rootNodes.push(node);
                    } else {
                        let parentNode = idToNodeMap[node.ParentPersonCategoryId];
                        node.level = parentNode.level + 1;
                        parentNode.children.push(node);
                    }
                });

                collectNodes(rootNodes);
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'person categories list'))
            .finally(function () {
                $scope.busy = false;
            });

        $scope.addNode = function (parent) {
            let newName = window.prompt("Person-Category Name:");

            let newNode = {
                CategoryName: newName,
                ParentPersonCategoryId: parent.PersonCategoryId,
                level: parent.level + 1
            };

            $http.post(GLOBALS.BASE_URL + '/api/v1/personCategories', newNode)
                .then(function () {
                    $route.reload();
                })
                .catch(_.partial(MessageManager.raiseError, 'add', 'person category'));
        };

        $scope.editNode = function (node) {
            node.CategoryName = window.prompt("Person-Category Name:", node.CategoryName);

            $http.post(GLOBALS.BASE_URL + '/api/v1/personCategories', Object.assign({}, node, {
                children: undefined,
                level: undefined
            }))
                .then(function () {
                    $route.reload();
                })
                .catch(_.partial(MessageManager.raiseError, 'update', 'person category'));
        };

        $scope.removeNode = function (node) {
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
