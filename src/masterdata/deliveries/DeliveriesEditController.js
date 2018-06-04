export default class DeliveriesEditController {
    constructor($scope, $q, $routeParams, $location, NgTableParams, GLOBALS, AuthService,
                PagedDeliveries, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();
        $scope.md = {};
        $scope.selection = {};
        $scope.text = {};
        
        if ($routeParams.id !== undefined) {
            $scope.busy = true;
                $q.then(() => {
                    if ($routeParams.id === 'new') {
                        $scope.delivery = {
                        };
                    } else {
                        PagedDeliveries.getDelivery($routeParams.id);
                    }
                })
                .finally(() => {
                    $scope.busy = false;
                });
        } else {
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    BatchId: 'desc',
                    RecipientName: 'asc'
                },
                count: 100
            }, {
                counts: [],
                getData: function (params) {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    return PagedDeliveries.getDeliveries($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                        .then((result) => {
                            $scope.busy = false;
                            params.total(result.TotalRows);

                            return result.Items;
                        })
                        .finally(() => {
                            $scope.busy = false;
                        });
                }
            });
        }

        $scope.cancel = function () {
            $location.path('/masterdata/deliveries');
        };
        $scope.save = function (delivery) {
            $scope.busy = true;
            
            let p = new Delivery(delivery);
            if (delivery.DeliveryId) {
                p.$saveDelivery({id: delivery.DeliveryId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'delivery'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'delivery'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.deleteDelivery = function (delivery) {
            DeliveryService.delete(delivery)
                .then(() => {
                    $scope.tableParams.reload();
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'delivery'));
        };
    }
}

