const concat = (x, y) => x.concat(y);

const flatMap = (f, xs) => xs.map(f).reduce(concat, []);

Array.prototype.flatMap = function (f) {
    return flatMap(f, this)
};

export class PersonCategoryService {

    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    loadPersonCategories() {
        return this.$http.get(this.GLOBALS.BASE_URL + '/api/v1/personCategories')
            .then(function (result) {
                return PersonCategoryService.mapTreeData(result.data);
            });

    }

    collectSelectedIds(nodes) {
        function flatNodeList(node) {
            let allNodes = [];

            allNodes.push(node);
            if(node.children) {
                node.children.forEach(node => flatNodeList(node));
            }

            return allNodes;
        }

        return nodes.flatMap(node => flatNodeList(node))
            .filter(node => node.selected)
            .map(node => node.PersonCategoryId);
    }

    static mapTreeData(queryResult) {
        let resultNodes = [];

        let treeData = queryResult;
        let idToNodeMap = {};
        let nodes = [];
        let rootNodes = [];

        function collectNodes(nodeArray) {
            for (let i = 0; nodeArray && i < nodeArray.length; i++) {
                let node = nodeArray[i];
                resultNodes.push(node);
                collectNodes(node.children);
            }
        }

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
                if (parentNode) {
                    node.level = parentNode.level + 1;
                    parentNode.children.push(node);
                } else {
                    rootNodes.push(node);
                }
            }
        });

        collectNodes(rootNodes);

        return resultNodes;
    }

}