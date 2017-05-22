export class PagedDeliveryCreationTests {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getDeliveryCreationTests(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/deliverycreationtests/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'deliveryCreationTests list'));
    }

    getDeliveryCreationTest(deliveryCreationTestId) {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/deliverycreationtests/${deliveryCreationTestId}`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'deliveryCreationTest'));
    }

    generateExampleDelivery(flightId) {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/deliverycreationtests/testdeliveryforflight/${flightId}`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'generate', 'testdeliveryforflight'));
    }
}

export class DeliveryCreationTest {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/deliverycreationtests/:id', null, {
            saveDeliveryCreationTest: {
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

export class DeliveryCreationTestService {
    constructor($q, DeliveryCreationTest) {
        return {
            delete: function (deliveryCreationTest, deliveryCreationTests) {
                let deferred = $q.defer();
                if (window.confirm('Do you really want to remove this deliveryCreationTest from the database?')) {
                    DeliveryCreationTest.delete({id: deliveryCreationTest.DeliveryCreationTestId}).$promise
                        .then(function () {
                            deliveryCreationTests = _.filter(deliveryCreationTests, function (d) {
                                return d.DeliveryCreationTestId !== deliveryCreationTest.DeliveryCreationTestId;
                            });
                            deferred.resolve(deliveryCreationTests);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(deliveryCreationTests);
                return deferred.promise;
            }
        };
    }
}