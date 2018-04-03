export default class PersonCategoryFilterDropdownDirective {
    static factory(PersonCategoryService, AuthService) {
        return {
            restrict: 'E',
            require: '^ngModel',
            template: `
                <div>
                    <input class="form-control" ng-model="filterIndicator" ng-click="toggleEditor()" readonly>
                    <div ng-if="editorVisible"
                         class="filter-choice-dropdown">        
                        <label><span translate="PERSON_CATEGORIES"></span> <i *ng-if="clubName">({{clubName}})</i></label>
                        <div class="filter-choices">
                            <input type="radio" ng-model="choice.filterStatus" ng-click="selectAll()" value="inactive"> Alle Kategorien (inkl. undefiniert)
                        </div>      
                        <div>
                            <input type="radio" ng-model="choice.filterStatus" ng-click="selectNone()" value="active"> Filter:
                        </div>
                        <div class="filter-choices">
                            <div class="filter-choice-list">
                                <fls-editable-tree id="personCategories"
                                                   checkbox-disabled="choice.filterStatus === 'inactive'"
                                                   data="{nodes: masterdata.personCategories}"
                                                   edit-mode="false"></fls-editable-tree>
                            </div>
                        </div>
                        <button ng-disabled="choice.filterStatus === 'active' && noCategorySelected()" class="btn btn-default pull-right" style="margin-top: 10px;" ng-click="toggleEditor()" translate="OK"></button>    
                        <button ng-disabled="choice.filterStatus === 'inactive'" class="btn btn-default pull-left" style="margin-top: 10px;margin-right: 5px;" ng-click="selectAll()" translate="ALL"></button>
                        <button ng-disabled="choice.filterStatus === 'inactive'" class="btn btn-default pull-left" style="margin-top: 10px;margin-right: 5px;" ng-click="selectNone()" translate="NONE"></button>
                        <button ng-disabled="choice.filterStatus === 'inactive'" class="btn btn-default pull-left" style="margin-top: 10px;margin-right: 5px;" ng-click="invert()" translate="INVERT"></button>
                    </div>
                </div>
            `,
            scope: {
                ngModel: '=',
                field: '@'
            },
            link: function (scope, element, attrs, modelCtrl) {
                scope.choice = {
                    filterStatus: 'inactive'
                };
                function updateViewValue() {
                    if (scope.choice.filterStatus === 'inactive') {
                        modelCtrl.$setViewValue(undefined);
                        scope.filterIndicator = "";
                    } else {
                        modelCtrl.$setViewValue(scope.masterdata.personCategories.filter(node => node.selected).map(node => node.PersonCategoryId));
                        scope.filterIndicator = "*"
                    }
                }

                scope.noCategorySelected = () => {
                    return scope.masterdata.personCategories.filter(node => node.selected).length === 0;
                };

                if (scope.ngModel) {
                    scope.masterdata = {
                        personCategories: scope.ngModel
                    };
                } else {
                    scope.masterdata = {
                        personCategories: []
                    };
                    PersonCategoryService.loadPersonCategories().then((result) => {
                        scope.masterdata.personCategories = Object.assign([], result);
                        scope.selectAll();

                        updateViewValue();
                    });
                }

                scope.clubName = AuthService.getUser().myClub.ClubName;

                scope.toggleEditor = () => {
                    updateViewValue();
                    scope.editorVisible = !scope.editorVisible;
                };

                scope.selectAll = () => {
                    scope.masterdata.personCategories.forEach(node => {
                        node.selected = true;
                    });
                };

                scope.selectNone = () => {
                    scope.masterdata.personCategories.forEach(node => {
                        node.selected = false;
                    });
                };

                scope.invert = () => {
                    scope.masterdata.personCategories.forEach(node => {
                        node.selected = !node.selected;
                    });
                };
            }
        };
    }
    ;
}
