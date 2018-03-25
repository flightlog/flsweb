export default class MessageManager {
    constructor($rootScope) {
        let srv = {
            observers: [],
            messages: [],
            notifyObservers: function () {
                for (let i = 0; i < srv.observers.length; i++) {
                    srv.observers[i].notify();
                }
            },
            displayError: function (msg, isError = true) {
                let error = {
                    msg: msg,
                    isError: isError
                };
                srv.messages.push(error);
                srv.notifyObservers();
            },
            displayRawMessageError: function (msg, rawMessage, isError = true) {
                let error = {
                    msg: msg,
                    rawMessage: rawMessage,
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
                return Promise.reject(error);
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