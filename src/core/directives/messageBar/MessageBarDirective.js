import * as _ from 'lodash';

export default class ErrorBarDirective {
    static factory(GLOBALS, MessageManager) {
        return {
            restrict: 'E',
            template: require('./message-bar-directive.html'),
            link: function (scope/*, element, attrs*/) {
                scope.debug = GLOBALS.DEBUG;
                scope.messages = MessageManager.messages;
                MessageManager.registerObserver(scope);

                function parseErrors() {
                    for (var i = 0; i < scope.messages.length; i++) {
                        var error = scope.messages[i];
                        if (error.data && error.data.ModelState) {
                            var m = error.data.ModelState;
                            error.invalidFields = [];
                            for (var field in m) {
                                if (m.hasOwnProperty(field)) {
                                    error.invalidFields.push({
                                        name: field,
                                        value: m[field]
                                    });
                                }
                            }
                        }
                    }
                }

                scope.notify = parseErrors;

                scope.dismiss = function (error) {
                    MessageManager.messages = _.reject(scope.messages, function (el) {
                        return el === error;
                    });
                    scope.messages = MessageManager.messages;
                };
            }
        };
    }
}
