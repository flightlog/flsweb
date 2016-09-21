import moment from "moment";
import * as angular from "angular";
import * as _ from "lodash";

import TimeService from "../../TimeService";

export default class TimeCounterDirective {
    static factory(TimeService) {
        return {
            restrict: 'A',
            require: 'ngModel',
            controller: TimeInputController,
            scope: {
                ngModel: '=',
                timeFormat: '='
            },
            link: function (scope, element, attrs, modelCtrl) {
                scope.el = element;
                function updateTimeFormat() {
                    scope._format = scope.timeFormat || "Min";
                    let origDelimiter = scope.delimiter;
                    scope.delimiter = ".";
                    if (scope._format === "Min") {
                        scope.delimiter = ":";
                    }
                    if(modelCtrl.$viewValue && modelCtrl.$viewValue.indexOf(origDelimiter) > -1
                        && origDelimiter !== scope.delimiter) {
                        modelCtrl.$setViewValue(modelCtrl.$viewValue.replace(origDelimiter, scope.delimiter));
                        modelCtrl.$render();
                    }
                    element.attr("placeholder", TimeService.engineCounterFormatString(scope._format));
                }
                updateTimeFormat();
                scope.$watch("timeFormat", updateTimeFormat);

                function normalizeString(plainString) {
                    if (!plainString || plainString.length < 3) {
                        return "0" + scope.delimiter + String("0" + plainString).slice(-2);
                    }

                    let delimiterIndex = plainString.length - 2;

                    return plainString.substring(0, delimiterIndex) + scope.delimiter + plainString.substring(delimiterIndex)
                }

                element.on('blur', () => {
                    if (modelCtrl.$viewValue && modelCtrl.$viewValue.indexOf(scope.delimiter) === -1) {
                        modelCtrl.$setViewValue(normalizeString(modelCtrl.$viewValue));
                        modelCtrl.$render();
                    }
                });
                modelCtrl.$formatters.push((value) => {
                    return TimeService.formatSecondsToLongHoursFormat(value, scope._format);
                });
                modelCtrl.$parsers.push((value) => {
                    if (value && value.indexOf(scope.delimiter) === -1) {
                        value = normalizeString(modelCtrl.$viewValue);
                    }
                    return TimeService.longDurationFormatToSeconds(value, scope._format);
                });
            }
        };
    };
}

class TimeInputController {

    constructor() {
    }

}