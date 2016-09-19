import Pikaday from "pikaday";
import moment from "moment";
import * as angular from "angular";
import * as _ from "lodash";

export default class DatePickerInputDirective {
    static factory($timeout) {
        return {
            restrict: 'E',
            require: '^ngModel',
            template: `
                    <div class="input-group col-md-12 col-sm-12 col-xs-12">
                          <input class="form-control"
                                 type="text"
                                 pikaday="myPicker"
                                 ng-model="stringDateValue"
                                 ng-required="isRequired"
                                 ng-change="checkIfEmpty()"
                                 on-select="onPikadaySelect(pikaday)"
                                 pattern="([0-9]{2}\\.){2}[0-9]{4}">
                          <span class="input-group-btn">
                                <button class="btn btn-default"
                                        type="button"
                                        ng-if="!isDisabled"
                                        ng-click="clear()">
                                      <span class="fa fa-times"></span>
                                 </button>
                          </span>
                    </div>
            `,
            controller: DataPickerInputController,
            scope: {
                ngModel: '=',
                hourOfDay: '@'
            },
            link: function (scope, element, attrs, modelCtrl) {
                let format = "DD.MM.YYYY";
                scope.el = angular.element(element.find("input"));

                scope.onPikadaySelect = (pikaday) => {
                    let filteredDate = pikaday.getMoment().format('YYYY-MM-DD');
                    let formattedTime = scope.hourOfDay ? 'T' + scope.hourOfDay + ':00:00Z' : 'T00:00:00Z';

                    modelCtrl.$setViewValue(new Date(filteredDate + formattedTime));
                };
                scope.checkIfEmpty = () => {
                    if (_.isEmpty(scope.stringDateValue)) {
                        modelCtrl.$setViewValue(undefined);
                    }
                };
                scope.clear = () => {
                    scope.myPicker.setDate(undefined);
                    modelCtrl.$setViewValue(undefined);
                };

                function setPikadayValue(modelValue) {
                    if (modelValue && moment(modelValue).isValid()) {
                        scope.stringDateValue = moment(modelValue).format(format);
                        modelCtrl.$setValidity("pikaday", true);
                    } else if (modelValue) {
                        modelCtrl.$setValidity("pikaday", false);
                    } else {
                        scope.stringDateValue = undefined;
                        modelCtrl.$setValidity("pikaday", !scope.ngRequired);
                    }
                }

                scope.$watch('ngModel', setPikadayValue);

                scope.$watch('ngDisabled', () => {
                    scope.isDisabled = !!attrs.disabled;
                });

                scope.$watch('ngRequired', () => {
                    scope.isRequired = !!attrs.required;
                });
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