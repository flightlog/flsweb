import * as _ from "lodash";

export default class PersonCategoriesController {
    constructor($scope, $route, $http, GLOBALS, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.editMode = false;
        $scope.data = {nodes: []};

        function collectNodes(nodeArray) {
            for (let i = 0; nodeArray && i < nodeArray.length; i++) {
                let node = nodeArray[i];
                $scope.data.nodes.push(node);
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
                $scope.data.nodes.length = 0;
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
                        if(parentNode) {
                            node.level = parentNode.level + 1;
                            parentNode.children.push(node);
                        } else {
                            rootNodes.push(node);
                        }
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
                ParentPersonCategoryId: parent && parent.PersonCategoryId
            };

            $http.post(GLOBALS.BASE_URL + '/api/v1/personCategories', newNode)
                .then(function () {
                    $route.reload();
                })
                .catch(_.partial(MessageManager.raiseError, 'add', 'person category'));
        };

        $scope.editNode = function (node) {
            node.CategoryName = window.prompt("Person-Category Name:", node.CategoryName);

            $http.post(GLOBALS.BASE_URL + '/api/v1/personCategories/' + node.PersonCategoryId, Object.assign({}, node, {
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
