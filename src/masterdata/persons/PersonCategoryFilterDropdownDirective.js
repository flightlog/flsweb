import {FlightStateMapper} from "../../flights/FlightsServices";

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
                        <div class="filter-choices">
                            <div class="filter-choice-list">
                                <label><span translate="PERSON_CATEGORIES"></span> <i *ng-if="clubName">({{clubName}})</i></label>
                                <fls-editable-tree id="personCategories"
                                                   data="{nodes: masterdata.personCategories}"
                                                   edit-mode="false"></fls-editable-tree>
                            </div>
                        </div>
                        <button class="btn btn-default pull-right" style="margin-top: 10px;" ng-click="toggleEditor()" translate="OK"></button>    
                        <button class="btn btn-default pull-left" style="margin-top: 10px;margin-right: 5px;" ng-click="reset()" translate="ALL"></button>
                        <button class="btn btn-default pull-left" style="margin-top: 10px;margin-right: 5px;" ng-click="selectNone()" translate="NONE"></button>
                        <button class="btn btn-default pull-left" style="margin-top: 10px;margin-right: 5px;" ng-click="invert()" translate="INVERT"></button>
                    </div>
                </div>
            `,
            scope: {
                ngModel: '=',
                field: '@'
            },
            link: function (scope, element, attrs, modelCtrl) {
                function updateViewValue() {
                    modelCtrl.$setViewValue(scope.masterdata.personCategories.filter(node => node.selected).map(node => node.PersonCategoryId));
                    scope.filterIndicator = scope.masterdata.personCategories.filter(node => !node.selected).length > 0 ? "*" : "";
                }

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
                        scope.reset();

                        updateViewValue();
                    });
                }

                scope.clubName = AuthService.getUser().myClub.ClubName;

                scope.toggleEditor = () => {
                    updateViewValue();
                    scope.editorVisible = !scope.editorVisible;
                };

                scope.reset = () => {
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
