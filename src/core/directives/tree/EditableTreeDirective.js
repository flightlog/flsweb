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
    
}