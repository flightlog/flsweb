import moment from "moment";
import TimeService from "../core/TimeService";
import {FlightStateMapper} from "../flights/FlightsServices"

export default class FlightReportsController {
    constructor($scope, $q, $log, $http, $modal, $translate, $timeout, MessageManager, $location, $routeParams,
                TimeService, FlightReports, NgTableParams, PagedFlights, AuthService, LocationPersister, PersonPersister,
                GLOBALS, TableSettingsCacheFactory, NavigationCache) {
        NavigationCache.setCancellingLocationHere();
        $scope.busy = true;

        $scope.debug = GLOBALS.DEBUG;
        $scope.showChart = false;

        $scope.PersonId = AuthService.getUser().PersonId;
        $scope.myUser = AuthService.getUser();
        $scope.myClub = AuthService.getUser().myClub;

        LocationPersister.get({id: $scope.myClub.HomebaseId}).$promise
            .then(location => {
                $scope.myHomeLocation = location;
            });

        PersonPersister.get({id: $scope.PersonId}).$promise
            .then(person => {
                $scope.person = person;
            });

        $scope.editFlight = (flight) => {
            switch (flight.FlightCategory) {
                case 'MotorFlight':
                    $location.path('/airmovements/' + flight.FlightId);
                break;
                case 'GliderFlight':
                    $location.path('/flights/' + flight.FlightId);
                break;
            }
        };

        let tableSettingsCache = {
            filter: {},
            sorting: {},
            count: 1
        };

        if ($routeParams.type) {
            switch ($routeParams.type) {
                case 'my-flights-today':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_TODAY';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 1000
                    });

                    break;
                case 'my-flights-yesterday':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_YESTERDAY';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-1, "days").format("YYYY-MM-DD"),
                                To: moment().add(-1, "days").format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'my-flights-last-7-days':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_LAST_7_DAYS';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-7, "days").format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'my-flights-last-30-days':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_LAST_30_DAYS';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-30, "days").format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'my-flights-last-12-months':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_LAST_12_MONTHS';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-12, "months").format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'my-flights-last-24-months':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_LAST_24_MONTHS';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-24, "months").format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'my-flights-this-year':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_THIS_YEAR';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().startOf('year').format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'my-flights-previous-year':
                    $scope.titleKey = 'REPORT_MY_FLIGHTS_PREVIOUS_YEAR';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-1, "years").startOf('year').format("YYYY-MM-DD"),
                                To: moment().add(-1, "years").endOf('year').format("YYYY-MM-DD")
                            },
                            FlightCrewPersonId: $scope.PersonId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'location-flights-today':
                    $scope.titleKey = 'REPORT_LOCATION_FLIGHTS_TODAY';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            LocationId: $scope.myClub.HomebaseId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'location-flights-yesterday':
                    $scope.titleKey = 'REPORT_LOCATION_FLIGHTS_YESTERDAY';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-1, "days").format("YYYY-MM-DD"),
                                To: moment().add(-1, "days").format("YYYY-MM-DD")
                            },
                            LocationId: $scope.myClub.HomebaseId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'location-flights-this-year':
                    $scope.titleKey = 'REPORT_LOCATION_FLIGHTS_THIS_YEAR';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().startOf('year').format("YYYY-MM-DD"),
                                To: moment().format("YYYY-MM-DD")
                            },
                            LocationId: $scope.myClub.HomebaseId
                        },
                        sorting: {
                            FlightDate: 'desc'
                        },
                        count: 100
                    });

                    break;
                case 'location-flights-previous-year':
                    $scope.titleKey = 'REPORT_LOCATION_FLIGHTS_PREVIOUS_YEAR';
                    tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController_" + $routeParams.type, {
                        filter: {
                            FlightDate: {
                                From: moment().add(-1, "years").startOf('year').format("YYYY-MM-DD"),
                                To: moment().add(-1, "years").endOf('year').format("YYYY-MM-DD")
                            },
                            LocationId: $scope.myClub.HomebaseId
                        },
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
                            $scope.FlightReportSummaries.forEach(summary => {
                                const seconds = moment.duration(summary.TotalFlightDuration).asSeconds();
                                summary._totalFlightDurationFormatted = TimeService.formatSecondsToLongHoursFormat(seconds);
                            });
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
