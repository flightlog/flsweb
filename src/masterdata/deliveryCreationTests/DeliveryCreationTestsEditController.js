export default class DeliveryCreationTestsEditController {
    constructor($scope, $routeParams, $location, NgTableParams, GLOBALS, AuthService, DeliveryCreationTestService,
                PagedDeliveryCreationTests, DeliveryCreationTest, MessageManager) {

        $scope.debug = GLOBALS.DEBUG;
        $scope.busy = true;
        $scope.isClubAdmin = AuthService.isClubAdmin();
        $scope.md = {};
        $scope.selection = {};
        $scope.text = {};

        if ($routeParams.id !== undefined) {
            if ($routeParams.id === 'new') {
                $scope.deliveryCreationTest = {
                    IsActive: true,
                    CanUpdateRecord: true
                };
                $scope.busy = false;
            } else {
                PagedDeliveryCreationTests.getDeliveryCreationTest($routeParams.id)
                    .then((result) => {
                        $scope.deliveryCreationTest = result;
                        if ($scope.deliveryCreationTest.ArticleTarget) {
                            $scope.selection.ArticleNumber = $scope.deliveryCreationTest.ArticleTarget.ArticleNumber;
                            $scope.text.DeliveryLineText = $scope.deliveryCreationTest.ArticleTarget.DeliveryLineText;
                        }
                        if ($scope.deliveryCreationTest.RecipientTarget) {
                            $scope.selection.PersonClubMemberNumber = $scope.deliveryCreationTest.RecipientTarget.PersonClubMemberNumber;
                            $scope.text.RecipientName = $scope.deliveryCreationTest.RecipientTarget.RecipientName;
                        }
                        $scope.md.flightDurationUnlimited = !($scope.deliveryCreationTest.MinFlightTimeInSecondsMatchingValue > 0 || $scope.deliveryCreationTest.MaxFlightTimeInSecondsMatchingValue < 2147483647);
                        $scope.md.showThreadsholdText = !!$scope.deliveryCreationTest.ThresholdText;
                    })
                    .finally(() => {
                        $scope.busy = false;
                    });
            }
        } else {
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    DeliveryCreationTestName: 'asc'
                },
                count: 100
            }, {
                counts: [],
                getData: function (params) {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    return PagedDeliveryCreationTests.getDeliveryCreationTests($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
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
            $location.path('/masterdata/deliveryCreationTests');
        };
        $scope.save = function (deliveryCreationTest) {
            $scope.busy = true;

            let p = new DeliveryCreationTest(deliveryCreationTest);
            if (deliveryCreationTest.DeliveryCreationTestId) {
                p.$saveDeliveryCreationTest({id: deliveryCreationTest.DeliveryCreationTestId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'update', 'deliveryCreationTest'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                p.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'deliveryCreationTest'))
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        };

        $scope.deleteDeliveryCreationTest = (deliveryCreationTest) => {
            DeliveryCreationTestService.delete(deliveryCreationTest)
                .then(() => {
                    $scope.tableParams.reload();
                })
                .catch(_.partial(MessageManager.raiseError, 'remove', 'deliveryCreationTest'));
        };


        $scope.newDeliveryCreationTest = () => {
            $location.path('/masterdata/deliveryCreationTests/new');
        };

        $scope.editDeliveryCreationTest = (deliveryCreationTest) => {
            $location.path('/masterdata/deliveryCreationTests/' + deliveryCreationTest.DeliveryCreationTestId);
        };

        $scope.createTestDelivery = () => {
            PagedDeliveryCreationTests.generateExampleDelivery($scope.deliveryCreationTest.FlightId)
                .then((deliveryExample) => {
                    $scope.deliveryCreationTest.ExpectedDeliveryDetails = JSON.stringify(deliveryExample, undefined, 2);
                });
        }


    }
}

