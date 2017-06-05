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
                        if ($scope.deliveryCreationTest.ExpectedDeliveryDetails) {
                            $scope.deliveryCreationTest.expectedDeliveryDetailsFormatted = JSON.stringify($scope.deliveryCreationTest.ExpectedDeliveryDetails, undefined, 2);
                            $scope.deliveryItems = $scope.deliveryCreationTest.ExpectedDeliveryDetails.DeliveryItems;
                        }
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
                            $scope.itemsOnCurrentPage = result.Items;

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
            ParseUtil.parseDetails(deliveryCreationTest);

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
            $scope.busy = true;
            PagedDeliveryCreationTests.generateExampleDelivery($scope.deliveryCreationTest.FlightId)
                .then((deliveryExample) => {
                    $scope.deliveryCreationTest.expectedDeliveryDetailsFormatted = ParseUtil.formatDetails(deliveryExample.CreatedDeliveryDetails);
                    $scope.deliveryItems = deliveryExample.CreatedDeliveryDetails.DeliveryItems;
                })
                .finally(() => {
                    $scope.busy = false;
                });
        };

        $scope.runTest = (testId) => {
            $scope.busy = true;
            PagedDeliveryCreationTests.runTest(testId)
                .then((result) => {
                    if (result.LastDeliveryCreationTestResult.LastTestSuccessful) {
                        MessageManager.showMessage("Test Result: Success!");
                    } else {
                        MessageManager.displayError("Test Result: Failure. " + result.LastDeliveryCreationTestResult.LastTestResultMessage);
                    }
                    $scope.lastDeliveryItems = result.LastDeliveryCreationTestResult.LastTestCreatedDeliveryDetails && result.LastDeliveryCreationTestResult.LastTestCreatedDeliveryDetails.DeliveryItems;
                    $scope.lastMatchedRuleFilters = result.LastDeliveryCreationTestResult.LastTestMatchedAccountingRuleFilterIds;
                })
                .finally(() => {
                    $scope.busy = false;
                });
        };

        $scope.openRuleFilter = (id) => {
            $location.path('/masterdata/accountingRuleFilters/' + id);
        };

        let updateExecutionBar = (executing, success, failure) => {
            let total = executing + success + failure;
            $scope.executingPercent = 100 * executing / total;
            $scope.successPercent = 100 * success / total;
            $scope.errorPercent = 100 * failure / total;
        };

        $scope.runAllTests = () => {
            if ($scope.itemsOnCurrentPage) {
                $scope.busy = true;

                let executing = $scope.itemsOnCurrentPage.length;
                let success = 0;
                let failure = 0;
                updateExecutionBar(executing, success, failure);
                let i = 0;
                for (; i < $scope.itemsOnCurrentPage.length; i++) {
                    let test = $scope.itemsOnCurrentPage[i];
                    if (test.IsActive) {
                        test.status = "executing...";
                        test.executing = true;
                        PagedDeliveryCreationTests.runTest(test.DeliveryCreationTestId)
                            .then((result) => {
                                success++;
                                if (!result.LastDeliveryCreationTestResult.LastTestSuccessful) {
                                    return Promise.reject("Test Error at '"
                                        + result.LastDeliveryCreationTestResult.LastTestRunOn + "': "
                                        + result.LastDeliveryCreationTestResult.LastTestResultMessage);
                                }
                                test.status = "Success!";
                                test.success = true;
                            })
                            .catch((error) => {
                                failure++;
                                test.status = "Failure: " + JSON.stringify(error);
                            })
                            .finally(() => {
                                test.executing = false;
                                executing--;
                                updateExecutionBar(executing, success, failure);
                            });
                    } else {
                        success++;
                        executing--;
                        test.status = "(skipped)";
                        test.skipped = true;
                        updateExecutionBar(executing, success, failure);
                    }
                }
                $scope.busy = false;
            }
        }

    }


}

export class ParseUtil {

    static parseDetails(deliveryCreationTest) {
        deliveryCreationTest.ExpectedDeliveryDetails = deliveryCreationTest.expectedDeliveryDetailsFormatted && JSON.parse(deliveryCreationTest.expectedDeliveryDetailsFormatted);
        delete deliveryCreationTest.expectedDeliveryDetailsFormatted;
    }

    static formatDetails(deliveryExample) {
        return JSON.stringify(deliveryExample, undefined, 2);
    }

}