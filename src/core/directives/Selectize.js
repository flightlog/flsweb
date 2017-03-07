/*
 * This class is based on angular-selectize: https://github.com/machineboy2045/angular-selectize/blob/master/dist/angular-selectize.js
 */
import Selectize from "selectize";

export default class SelectizeDirective {
    static factory(selectizeConfig) {
        return {
            restrict: 'EA',
            require: '^ngModel',
            scope: {ngModel: '=', config: '=?', options: '=?', ngDisabled: '=', ngRequired: '&'},
            link: function (scope, plainElement, attrs, modelCtrl) {
                let element = $(plainElement);

                let selectize;
                let settings = angular.extend({}, Selectize.defaults, selectizeConfig, scope.config);

                scope.options = scope.options || [];
                scope.config = scope.config || {};

                let isEmpty = function (val) {
                    return val === undefined || val === null || !val.length; //support checking empty arrays
                };

                let toggle = function (disabled) {
                    disabled ? selectize.disable() : selectize.enable();
                };

                let validate = function () {
                    let isInvalid = (scope.ngRequired() || attrs.required || settings.required) && isEmpty(scope.ngModel);
                    modelCtrl.$setValidity('required', !isInvalid);
                };

                let setSelectizeOptions = function (curr, prev) {
                    angular.forEach(prev, function (opt) {
                        if (curr.indexOf(opt) === -1) {
                            let value = opt[settings.valueField];
                            selectize.removeOption(value, true);
                        }
                    });

                    selectize.addOption(curr, true);

                    selectize.refreshOptions(false); // updates results if user has entered a query
                    setSelectizeValue();
                };

                let setSelectizeValue = function () {
                    validate();

                    selectize.$control.toggleClass('ng-valid', modelCtrl.$valid);
                    selectize.$control.toggleClass('ng-invalid', modelCtrl.$invalid);
                    selectize.$control.toggleClass('ng-dirty', modelCtrl.$dirty);
                    selectize.$control.toggleClass('ng-pristine', modelCtrl.$pristine);

                    if (!angular.equals(selectize.items, scope.ngModel)) {
                        selectize.setValue(scope.ngModel, true);
                    }
                };

                settings.onChange = function () {
                    let value = angular.copy(selectize.items);
                    if (settings.maxItems == 1) {
                        value = value[0]
                    }
                    modelCtrl.$setViewValue(value);

                    if (scope.config.onChange) {
                        scope.config.onChange.apply(this, arguments);
                    }
                };

                settings.onOptionAdd = function (value, data) {
                    if (scope.options.indexOf(data) === -1) {
                        scope.options.push(data);

                        if (scope.config.onOptionAdd) {
                            scope.config.onOptionAdd.apply(this, arguments);
                        }
                    }
                };

                settings.onInitialize = function () {
                    selectize = element[0].selectize;

                    setSelectizeOptions(scope.options);

                    //provides a way to access the selectize element from an
                    //angular controller
                    if (scope.config.onInitialize) {
                        scope.config.onInitialize(selectize);
                    }

                    scope.$watchCollection('options', setSelectizeOptions);
                    scope.$watch('ngModel', setSelectizeValue);
                    scope.$watch('ngDisabled', toggle);
                };


                element.selectize(settings);

                element.on('$destroy', function () {
                    if (selectize) {
                        selectize.destroy();
                        element = null;
                    }
                });
            }
        };
    };
}