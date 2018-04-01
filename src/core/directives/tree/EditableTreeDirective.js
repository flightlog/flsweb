export default class EditableTreeDirective {
    static factory() {
        return {
            restrict: 'E',
            template: require('./editable-tree-directive.html'),
            scope: {
                data: "=",
                onAddNode: "=",
                onEditNode: "=",
                onDeleteNode: "=",
                onSelectionChanged: "=",
                nodeNameAttribute: "@",
                editMode: "="
            },
            bindToController: true,
            controllerAs: "ctrl",
            controller: EditableTreeController
        };
    }
}

class EditableTreeController {

    constructor($scope) {
        this.ctrlScope = $scope.ctrl;
    }

    addNode(parent) {
        this.ctrlScope.onAddNode(parent);
    }

    editNode(parent) {
        this.ctrlScope.onEditNode(parent);
    }

    deleteNode(parent) {
        this.ctrlScope.onDeleteNode(parent);
    }

    toggleChildren(node) {
        if (node.children) {
            node.children.forEach((child) => {
                child.selected = node.selected;
                this.toggleChildren(child);
            });
        }
        if(this.ctrlScope.onSelectionChanged) {
            this.ctrlScope.onSelectionChanged(node);
        }
    }

}