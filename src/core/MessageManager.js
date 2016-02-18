export default class MessageManager {
    constructor($rootScope) {
        var srv = {
            observers: [],
            messages: [],
            notifyObservers: function () {
                for (var i = 0; i < srv.observers.length; i++) {
                    srv.observers[i].notify();
                }
            },
            displayError: function (msg, isError = true) {
                var error = {
                    msg: msg,
                    isError: isError
                };
                srv.messages.push(error);
                srv.notifyObservers();
            },
            raiseError: function (operation, entity, error) {
                error.operation = operation;
                error.entity = entity;
                error.isError = true;
                srv.messages.push(error);
                srv.notifyObservers();
            },
            showMessage: function (message) {
                srv.displayError(message, false);
            },
            registerObserver: function (observer) {
                srv.observers.push(observer);
            },
            reset: function () {
                srv.messages.length = 0;
                srv.notifyObservers();
            }
        };
        $rootScope.$on('$routeChangeStart',
            function (/*next, current*/) {
                srv.reset();
            });

        return srv;
    }
}