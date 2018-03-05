import moment from "moment";
import * as _ from "lodash";

export default class FlightReportsController {
    constructor($scope, $q, $log, $http, $modal, $translate, $timeout, MessageManager, $location, $routeParams,
                TimeService, FlightReports, NgTableParams, PagedFlights, AuthService,
                GLOBALS, TableSettingsCacheFactory,
                Clubs, DropdownItemsRenderService,
                localStorageService, RoutesPerLocation) {
        $scope.busy = true;
        this.TimeService = TimeService;

        if (!localStorageService.get("towPilotByAircraftId")) {
            localStorageService.set("towPilotByAircraftId", {});
        }

        $scope.debug = GLOBALS.DEBUG;
        $scope.showChart = false;
        let format = 'HH:mm';

        $scope.starttypes = [];
        $scope.locations = [];
        $scope.gliderPilots = [];
        $scope.towingPilots = [];
        $scope.md = {};

        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();

        let tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightReportsController", {
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

        if ($routeParams.id !== undefined) {
            loadMasterdata()
                .then(() => {
                    if ($routeParams.id === 'new') {
                        return newFlight();
                    } else if ($location.path().indexOf('/copy') > 0) {
                        return copyFlight($routeParams.id);
                    } else {
                        return loadFlight($routeParams.id);
                    }
                })
                .then(mapFlightToForm)
                .catch(_.partial(MessageManager.raiseError, 'load', 'masterdata'));
        } else {
            $scope.tableParams = new NgTableParams(tableSettingsCache.currentSettings(), {
                counts: [],
                getData: (params) => {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;
                    tableSettingsCache.update($scope.tableParams.filter(), $scope.tableParams.sorting());

                    let filterWithStates = FlightStateMapper.filterWithState($scope.tableParams.filter());
                    let sortingWithStates = FlightStateMapper.sortingWithState($scope.tableParams.sorting());

                    return PagedFlights.getGliderFlights(filterWithStates, sortingWithStates, pageStart, pageSize)
                        .then((result) => {
                            $scope.busy = false;
                            params.total(result.TotalRows);
                            let flights = result.Items;
                            for (let i = 0; i < result.length; i++) {
                                flights[i]._formattedDate = result[i].StartDateTime && moment(result[i].StartDateTime).format('DD.MM.YYYY HH:mm dddd');
                            }

                            return result.Items;
                        })
                        .finally(() => {
                            $scope.busy = false;
                        });
                }
            });
        }
        
        

        function loadFlight(flightId) {
            return Flights.getFlight({id: flightId}).$promise;
        }
        
        $scope.getTimeNow = () => {
            return TimeService.time(new Date());
        };

        $scope.getDateToday = () => {
            return new Date();
        };

        function loadMasterdata() {
            $scope.busy = true;
            let promises = [
                PersonsV2.getAllPersons().$promise.then((result) => {
                    angular.copy(result, $scope.allPersons);
                }),
                Locations.getLocations().$promise.then((result) => {
                    angular.copy(result, $scope.locations);
                })
            ];
            return $q.all(promises)
                .finally(() => {
                    $scope.busy = $scope.busyLoadingFlight;
                });
        }
        
        $scope.formatGliderStart = () => {
            let times = $scope.times;
            times.gliderStart = this.TimeService.formatTime(times.gliderStart);
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
        };
        
        $scope.formatGliderLanding = () => {
            let times = $scope.times;
            times.gliderLanding = this.TimeService.formatTime(times.gliderLanding);
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
            $scope.flightDetails.GliderFlightDetailsData.NrOfLdgs = $scope.flightDetails.GliderFlightDetailsData.NrOfLdgs || 1;
            calcDurationWarning();
        };
        
        $scope.formatGliderDuration = () => {
            let times = $scope.times;
            times.gliderDuration = this.TimeService.formatTime(times.gliderDuration);
            times.gliderLanding = calcLanding(times.gliderStart, times.gliderDuration);
            calcDurationWarning();
        };

        $scope.formatTowLanding = () => {
            let times = $scope.times;
            times.towingLanding = this.TimeService.formatTime(times.towingLanding);
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
            $scope.flightDetails.TowFlightDetailsData.NrOfLdgs = $scope.flightDetails.TowFlightDetailsData.NrOfLdgs || 1
            calcDurationWarning();
        };
        
        $scope.formatTowDuration = () => {
            let times = $scope.times;
            times.towingDuration = this.TimeService.formatTime(times.towingDuration);
            times.towingLanding = calcLanding(times.gliderStart, times.towingDuration);
            calcDurationWarning();
        };
        
        $scope.cancel = () => {
            $location.path('/flights');
        };
    }
}
