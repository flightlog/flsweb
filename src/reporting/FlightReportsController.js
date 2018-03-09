import moment from "moment";
import {FlightStateMapper} from "../flights/FlightsServices"

export default class FlightReportsController {
    constructor($scope, $q, $log, $http, $modal, $translate, $timeout, MessageManager, $location, $routeParams,
                TimeService, FlightReports, NgTableParams, PagedFlights, AuthService,
                GLOBALS, TableSettingsCacheFactory) {
        $scope.busy = true;

        $scope.debug = GLOBALS.DEBUG;
        $scope.showChart = false;

        let tableSettingsCache = {
            filter: {},
            sorting: {},
            count: 1
        };

        if($routeParams.type) {
            switch ($routeParams.type) {
                case 'my-flights-today':
                    $scope.titleKey = 'MY_FLIGHTS_TODAY';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            }
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'my-flights-yesterday':
                    $scope.titleKey = 'MY_FLIGHTS_YESTERDAY';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-1, "days").format("YYYY-MM-DD"),
                                To: moment().add(-1, "days").format("YYYY-MM-DD")
                            }
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'foo-bar':
                    $scope.titleKey = 'FOO_BAR';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {},
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                default:
                    $scope.titleKey = 'UNKNOWN';
            }

            $scope.tableParams = new NgTableParams(tableSettingsCache.currentSettings(), {
                counts: [],
                getData: (params) => {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;
                    tableSettingsCache.update($scope.tableParams.filter(), $scope.tableParams.sorting());

                    let filterWithStates = FlightStateMapper.filterWithState($scope.tableParams.filter());
                    let sortingWithStates = FlightStateMapper.sortingWithState($scope.tableParams.sorting());

                    return FlightReports.getFlightReports(filterWithStates, sortingWithStates, pageStart, pageSize)
                        .then((result) => {
                            $scope.busy = false;
                            $scope.FlightReportFilterCriteria = result.FlightReportFilterCriteria;
                            $scope.FlightReportSummaries = result.FlightReportSummaries;
                            params.total(result.Flights.TotalRows);
                            let flights = result.Flights.Items;
                            for (let i = 0; i < result.length; i++) {
                                flights[i]._formattedDate = result[i].StartDateTime && moment(result[i].StartDateTime).format('DD.MM.YYYY HH:mm dddd');
                            }

                            return result.Flights.Items;
                        })
                        .finally(() => {
                            $scope.busy = false;
                        });
                }
            });
        }
    }
}
