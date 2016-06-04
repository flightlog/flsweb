import moment from "moment";
import * as angular from "angular";
import * as _ from "lodash";

import TimeService from "../../TimeService";

export default class TimeInputDirective {
    static factory(TimeService) {
        return {
            restrict: 'A',
            require: 'ngModel',
            controller: TimeInputController,
            scope: {
                ngModel: '='
            },
            link: function (scope, element, attrs, modelCtrl) {
                let originalDate = moment(scope.ngModel);

                let format = "HH:mm";
                let pattern = /^[0-9]{2}:[0-9]{2}$/;
                scope.el = element;
                scope.val = {};
                element.attr("placeholder", "__:__");

                function isValid(timeValue) {
                    return !!timeValue && timeValue.match(pattern) !== null && moment(timeValue, format).isValid();
                }

                function parse(value) {
                    if (isValid(value)) {
                        let parsed = moment(value, format);
                        originalDate.hours(parsed.hours()).minutes(parsed.minutes());
                        return originalDate;
                    }
                }

                element.on('blur', () => {
                    scope.ngModel = parse(TimeService.formatTime(modelCtrl.$viewValue));
                    scope.$apply();
                });
                modelCtrl.$formatters.push((value) => {
                    var localDate = moment(value);
                    return localDate.isValid() && localDate.format(format) || value;
                });
                modelCtrl.$parsers.push(parse);
                modelCtrl.$validators.validTime = (modelValue, viewValue) => {
                    return isValid(viewValue);
                };
            }
        };
    };
}

class TimeInputController {

    constructor() {
    }

}