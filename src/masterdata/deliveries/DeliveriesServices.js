export class PagedDeliveries {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getDeliveries(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/deliveries/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'deliveries list'));
    }

    getDelivery(deliveryId) {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/deliveries/${deliveryId}`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'delivery'));
    }
}

export class Delivery {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/deliveries/:id', null, {
            saveDelivery: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
            },
            delete: {
                method: 'POST',
                params: {
                    id: '@id'
                },
                headers: {
                    'X-HTTP-Method-Override': 'DELETE'
                }
            }
        });
    }
}

export class DeliveryService {
    constructor($q) {
        return {
            delete: function (delivery, deliveries) {
                var deferred = $q.defer();
                if (window.confirm('Do you really want to delete this delivery from the database and reset the flights process state?')) {
                    delivery.delete({id: delivery.DeliveryId}).$promise
                        .then(function () {
                            deliveries = _.filter(deliveries, function (d) {
                                return d.DeliveryId !== delivery.DeliveryId;
                            });
                            deferred.resolve(deliveries);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(deliveries);
                return deferred.promise;
            }
        };
    }
}