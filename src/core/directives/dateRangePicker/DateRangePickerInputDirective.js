import Pikaday from "pikaday";
import moment from "moment";
import * as angular from "angular";
import * as _ from "lodash";

export default class DatePickerInputDirective {
    static factory() {
        return {
            restrict: 'E',
            require: '^ngModel',
            template: `
                <div>
                    <input class="form-control" ng-model="formattedDate" ng-click="toggleEditor()" readonly>
                    <div ng-if="editorVisible" style="position:absolute;z-index:9999;background-color:white;padding:10px;border: 1px solid #d0d0d0;border-radius:5px;width:200px;">
                        From:
                        <fls-date-picker name="dates.from"
                                         ng-change="setResult()"
                                         ng-model="dates.fromDate">
                        </fls-date-picker>
                        
                        To:
                        <fls-date-picker name="dates.to"
                                         ng-change="setResult()"
                                         ng-model="dates.toDate">
                        </fls-date-picker>
                        
                        <button class="btn btn-default pull-right" style="margin-top:10px;" ng-click="toggleEditor()">Close</button>
                    </div>
                </div>
            `,
            controller: DataPickerInputController,
            scope: {
                ngModel: '=',
            },
            link: function (scope, element, attrs, modelCtrl) {
                let format = "DD.MM.YYYY";
                scope.dates = {};

                scope.toggleEditor = () => {
                    scope.editorVisible = !scope.editorVisible;
                };
                scope.el = angular.element(element.find("input"));

                function formatObject(filterObject) {
                    if (filterObject) {
                        if (filterObject.From) {
                            setFromValue(filterObject.From);
                            scope.dates.fromDate = moment(scope.dates.from, format);
                        }
                        if (filterObject.To) {
                            setToValue(filterObject.To);
                            scope.dates.toDate = moment(scope.dates.to, format);
                        }
                        scope.setResult();
                    }
                }

                function setFromValue(modelValue) {
                    if (modelValue && moment(modelValue).isValid()) {
                        scope.dates.from = moment(modelValue).format(format);
                        modelCtrl.$setValidity("from", true);
                    } else if (modelValue) {
                        modelCtrl.$setValidity("from", false);
                    } else {
                        scope.dates.from = undefined;
                    }
                }

                function setToValue(modelValue) {
                    if (modelValue && moment(modelValue).isValid()) {
                        scope.dates.to = moment(modelValue).format(format);
                        modelCtrl.$setValidity("to", true);
                    } else if (modelValue) {
                        modelCtrl.$setValidity("to", false);
                    } else {
                        scope.dates.to = undefined;
                    }
                }

                function formatOrUndefined(date) {
                    return date && moment(date).format(format);
                }

                scope.setResult = () => {
                    let formattedStartDate = formatOrUndefined(scope.dates.fromDate);
                    let formattedEndDate = formatOrUndefined(scope.dates.toDate);
                    if (scope.dates.fromDate && scope.dates.toDate) {
                        scope.formattedDate = formattedStartDate + ' - ' + formattedEndDate;
                    } else if (scope.dates.fromDate) {
                        scope.formattedDate = formattedStartDate;
                    } else if (scope.dates.toDate) {
                        scope.formattedDate = formattedEndDate;
                    } else {
                        scope.formattedDate = undefined;
                    }
                    
                    modelCtrl.$setViewValue({
                        From: scope.dates.fromDate && moment(scope.dates.fromDate).format("YYYY-MM-DD"),
                        To: scope.dates.toDate && moment(scope.dates.toDate).format("YYYY-MM-DD")
                    });
                };

                formatObject(scope.ngModel);
            }
        };
    };
}

class DataPickerInputController {

    constructor($scope, $timeout) {
        $scope.myPicker = new Pikaday({
            field: $scope.el
        });
        let maxNumUpdates = 100;
        let i = 0;

        $scope.$watch('ngModel', () => {
            $timeout(() => {
                if ($scope.ngModel && moment($scope.ngModel).format("YYYY-MM-DD") !== $scope.myPicker.getMoment().format("YYYY-MM-DD") && i++ < maxNumUpdates) {
                    $scope.myPicker.setDate(moment($scope.ngModel).toDate());
                }
            }, 0);
        });
    }

}