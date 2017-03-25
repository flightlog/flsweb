import moment from "moment";
import * as _ from "lodash";
import AddPersonController from "../masterdata/persons/modal/AddPersonController";

export default class FlightsController {
    constructor($scope, $q, $log, $modal, $timeout, MessageManager, $location, $routeParams,
                TimeService, Flights, NgTableParams, PagedFlights, AuthService,
                FlightTypes, Locations, Persons, PersonsV2, PersonPersister, PassengerPersister,
                Aircrafts, StartTypes, GLOBALS, FlightCostBalanceTypes, TableSettingsCacheFactory,
                SoloFlightCheckboxEnablementCalculator, Clubs, AircraftOperatingCounters, DropdownItemsRenderService) {
        $scope.busy = true;
        this.TimeService = TimeService;
        $scope.debug = GLOBALS.DEBUG;
        $scope.showChart = false;
        let format = 'HH:mm';
        $scope.gliderImg = require('../images/glider.png');
        $scope.towPlaneImg = require('../images/towplane.png');
        $scope.isClubAdmin = AuthService.isClubAdmin();

        $scope.starttypes = [];
        $scope.locations = [];
        $scope.gliderFlightTypes = [];
        $scope.towingFlightTypes = [];
        $scope.gliderAircrafts = [];
        $scope.towerAircrafts = [];
        $scope.allPersons = [];
        $scope.gliderPilots = [];
        $scope.towingPilots = [];
        $scope.observers = [];
        $scope.winchOperators = [];
        $scope.instructors = [];
        $scope.flightCostBalanceTypes = [];
        $scope.filterDates = {};

        $scope.renderStarttype = DropdownItemsRenderService.starttypeRenderer();
        $scope.renderFlighttype = DropdownItemsRenderService.flighttypeRenderer();
        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderAircraft = DropdownItemsRenderService.aircraftRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();

        let tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("FlightsController", {
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

                    return PagedFlights.getGliderFlights($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
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

        function hasDetails() {
            return $scope.flightDetails && $scope.flightDetails.GliderFlightDetailsData !== undefined;
        }

        $scope.gliderAircraftSelectionChanged = (resetEngineOperatingCounters) => {
            $timeout(() => {
                if (hasDetails()) {
                    $scope.gliderCompetitionSign = '?';
                    if (resetEngineOperatingCounters) {
                        $scope.flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds = undefined;
                        $scope.flightDetails.GliderFlightDetailsData.EngineEndOperatingCounterInSeconds = undefined;
                    }
                    if ($scope.flightDetails && $scope.gliderAircrafts) {
                        for (let i = 0; i < $scope.gliderAircrafts.length; i++) {
                            let glider = $scope.gliderAircrafts[i];
                            if (glider.AircraftId === $scope.flightDetails.GliderFlightDetailsData.AircraftId) {
                                if (!$scope.flightDetails.GliderFlightDetailsData.IsSoloFlight && glider.NrOfSeats === 1) {
                                    $scope.flightDetails.GliderFlightDetailsData.IsSoloFlight = true;
                                }
                                $scope.selectedGliderAircraft = glider;
                                $scope.gliderCompetitionSign = glider.CompetitionSign;

                                if (glider.HasEngine) {
                                    AircraftOperatingCounters.query({AircraftId: glider.AircraftId}).$promise.then((result) => {
                                        $scope.operatingCounters = result;
                                        console.log("$scope.operatingCounters", $scope.operatingCounters);
                                        $scope.times.lastOperatingCounterFormatted = TimeService.formatSecondsToLongHoursFormat(
                                            $scope.operatingCounters.EngineOperatingCounterInSeconds,
                                            $scope.operatingCounters.EngineOperatingCounterUnitTypeKeyName
                                        );
                                        console.log("$scope.times", $scope.times);
                                        $scope.engineSecondsCountersChanged();
                                    }).catch(_.partial(MessageManager.raiseError, 'load', 'operating counters'));
                                }
                            }
                        }
                    }
                    recalcCheckboxState();
                    calcNumberOfSeatWarning();
                }
            }, 0);
        };

        $scope.towingAircraftSelectionChanged = () => {
            if ($scope.flightDetails.TowFlightDetailsData && !$scope.flightDetails.TowFlightDetailsData.PilotPersonId) {
                $scope.flightDetails.TowFlightDetailsData.PilotPersonId = "";
            }
            $timeout(() => {
                if (hasDetails()) {
                    $scope.towplaneRegistration = '';
                    if ($scope.flightDetails && $scope.towerAircrafts) {
                        for (let i = 0; i < $scope.towerAircrafts.length; i++) {
                            let tow = $scope.towerAircrafts[i];
                            if (tow.AircraftId === ($scope.flightDetails.TowFlightDetailsData && $scope.flightDetails.TowFlightDetailsData.AircraftId)) {
                                $scope.flightDetails.TowFlightDetailsData.AircraftId = tow.AircraftId;
                                $scope.towplaneRegistration = tow.Immatriculation.substring(tow.Immatriculation.indexOf('-') + 1);
                            }
                        }
                    }
                }
            }, 0);
        };

        function initForNewFlight(flightDetails) {
            let deferred = $q.defer();
            flightDetails.GliderFlightDetailsData.FlightCostBalanceType = 1;
            flightDetails.CanUpdateRecord = true;

            Clubs.getMyClub().$promise
                .then((result) => {
                    $scope.myClub = result;
                    flightDetails.GliderFlightDetailsData.StartLocationId = flightDetails.GliderFlightDetailsData.StartLocationId || $scope.myClub.HomebaseId;
                    flightDetails.GliderFlightDetailsData.LdgLocationId = flightDetails.GliderFlightDetailsData.LdgLocationId || $scope.myClub.HomebaseId;
                    flightDetails.GliderFlightDetailsData.FlightTypeId = flightDetails.GliderFlightDetailsData.FlightTypeId || $scope.myClub.DefaultGliderFlightTypeId;
                    flightDetails.GliderFlightDetailsData.NrOfLdgs = 1;
                    flightDetails.TowFlightDetailsData.StartLocationId = flightDetails.TowFlightDetailsData.StartLocationId || $scope.myClub.HomebaseId;
                    flightDetails.TowFlightDetailsData.LdgLocationId = flightDetails.TowFlightDetailsData.LdgLocationId || $scope.myClub.HomebaseId;
                    flightDetails.TowFlightDetailsData.FlightTypeId = flightDetails.TowFlightDetailsData.FlightTypeId || $scope.myClub.DefaultTowFlightTypeId;
                    flightDetails.TowFlightDetailsData.NrOfLdgs = 1;
                    flightDetails.StartType = flightDetails.StartType || $scope.myClub.DefaultStartType || "1";

                    deferred.resolve(flightDetails);
                })
                .catch((reason) => {
                    deferred.reject(reason);
                });

            return deferred.promise;
        }

        function loadFlight(flightId) {
            return Flights.getFlight({id: flightId}).$promise;
        }

        function newFlight() {
            return $q.when(initForNewFlight({
                GliderFlightDetailsData: {},
                TowFlightDetailsData: {}
            }));
        }

        function copyFlight(flightId) {
            return loadFlight(flightId)
                .then((res) => {
                    let flightDetails = {};
                    flightDetails.FlightDate = res.FlightDate;
                    flightDetails.GliderFlightDetailsData = res.GliderFlightDetailsData || {};
                    flightDetails.StartType = res.StartType;
                    flightDetails.FlightId = undefined;
                    flightDetails.TowFlightDetailsData = res.TowFlightDetailsData || {};
                    flightDetails.GliderFlightDetailsData.FlightId = undefined;
                    flightDetails.GliderFlightDetailsData.StartDateTime = undefined;
                    flightDetails.GliderFlightDetailsData.LdgDateTime = undefined;
                    flightDetails.GliderFlightDetailsData.FlightComment = undefined;
                    flightDetails.GliderFlightDetailsData.CouponNumber = undefined;
                    flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds = undefined;
                    flightDetails.GliderFlightDetailsData.EngineEndOperatingCounterInSeconds = undefined;
                    flightDetails.TowFlightDetailsData.FlightId = undefined;
                    flightDetails.TowFlightDetailsData.StartDateTime = undefined;
                    flightDetails.TowFlightDetailsData.LdgDateTime = undefined;
                    flightDetails.TowFlightDetailsData.FlightComment = undefined;

                    return initForNewFlight(flightDetails);
                });
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
                Persons.getGliderPilots().$promise.then((result) => {
                    angular.copy(result, $scope.gliderPilots);
                }),
                Persons.getTowingPilots().$promise.then((result) => {
                    angular.copy(result, $scope.towingPilots);
                }),
                Persons.getGliderInstructors().$promise.then((result) => {
                    angular.copy(result, $scope.instructors);
                }),
                Persons.getGliderObservers().$promise.then((result) => {
                    angular.copy(result, $scope.observers);
                }),
                Persons.getWinchOperators().$promise.then((result) => {
                    angular.copy(result, $scope.winchOperators);
                }),
                Locations.getLocations().$promise.then((result) => {
                    angular.copy(result, $scope.locations);
                }),
                Aircrafts.getGliders().$promise.then((result) => {
                    angular.copy(result, $scope.gliderAircrafts);
                }),
                Aircrafts.getTowingPlanes().$promise.then((result) => {
                    angular.copy(result, $scope.towerAircrafts);
                }),
                StartTypes.query().$promise.then((result) => {
                    angular.copy(result, $scope.starttypes);
                }),
                FlightTypes.queryFlightTypesFor({dest: 'gliders'}).$promise.then((result) => {
                    angular.copy(result, $scope.gliderFlightTypes);
                }),
                FlightTypes.queryFlightTypesFor({dest: 'towing'}).$promise.then((result) => {
                    angular.copy(result, $scope.towingFlightTypes);
                }),
                FlightCostBalanceTypes.query().$promise.then((result) => {
                    angular.copy(result, $scope.flightCostBalanceTypes);
                }),
                Clubs.getMyClub().$promise.then((result) => {
                    angular.copy(result, $scope.myClub);
                })
            ];
            return $q.all(promises)
                .finally(() => {
                    $scope.busy = $scope.busyLoadingFlight;
                });
        }

        function mapFlightToForm(result) {
            $scope.flightDetails = result;
            if (result.TowFlightDetailsData && result.TowFlightDetailsData.AircraftId === '00000000-0000-0000-0000-000000000000') {
                result.TowFlightDetailsData.AircraftId = "";
            }
            if (result.TowFlightDetailsData && result.TowFlightDetailsData.PilotPersonId === '00000000-0000-0000-0000-000000000000') {
                result.TowFlightDetailsData.PilotPersonId = "";
            }

            let gld = $scope.flightDetails.GliderFlightDetailsData;
            let tow = $scope.flightDetails.TowFlightDetailsData;
            $scope.times = {
                gliderStart: TimeService.time(gld && gld.StartDateTime),
                gliderLanding: TimeService.time(gld && gld.LdgDateTime),
                towingStart: TimeService.time(gld && gld.StartDateTime),
                towingLanding: TimeService.time(tow && tow.LdgDateTime),
                engineCounterFormat: 'seconds'
            };
            $scope.flightDetails.FlightDate = $scope.flightDetails.FlightDate || gld && (gld.StartDateTime || gld.FlightDate) || (!result.FlightId && new Date());
            $scope.times.gliderDuration = calcDuration($scope.times.gliderStart, $scope.times.gliderLanding);
            $scope.times.towingDuration = calcDuration($scope.times.gliderStart, $scope.times.towingLanding);

            $scope.flightTypeChanged();
            $scope.flightCostBalanceTypeChanged();
            $scope.startTypeChanged();
            $scope.gliderAircraftSelectionChanged();
            $scope.towingAircraftSelectionChanged();
            calcDurationWarning();
            recalcRouteRequirements();
        }

        $scope.save = function (flightDetails) {
            MessageManager.reset();
            $scope.busyLoadingFlight = true;

            let flightDate = moment(flightDetails.FlightDate).format("DD.MM.YYYY");
            flightDetails.GliderFlightDetailsData.StartDateTime = TimeService.parseDateTime(flightDate, $scope.times.gliderStart);
            flightDetails.GliderFlightDetailsData.LdgDateTime = TimeService.parseDateTime(flightDate, $scope.times.gliderLanding);
            if (!flightDetails.TowFlightDetailsData) {
                flightDetails.TowFlightDetailsData = {};
            }
            flightDetails.TowFlightDetailsData.StartDateTime = $scope.flightDetails.GliderFlightDetailsData.StartDateTime;
            flightDetails.TowFlightDetailsData.StartLocationId = $scope.flightDetails.GliderFlightDetailsData.StartLocationId;
            flightDetails.TowFlightDetailsData.OutboundRoute = $scope.flightDetails.GliderFlightDetailsData.OutboundRoute;
            flightDetails.TowFlightDetailsData.LdgDateTime = TimeService.parseDateTime(flightDate, $scope.times.towingLanding);

            if (!$scope.needsTowplane(flightDetails.StartType) || !flightDetails.TowFlightDetailsData.AircraftId) {
                flightDetails.TowFlightDetailsData = undefined;
            }

            if (flightDetails.FlightId) {
                new Flights(flightDetails).$saveFlight({id: flightDetails.FlightId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'flight'));
            } else {
                new Flights(flightDetails).$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'flight'));
            }
        };

        $scope.delete = function (flight) {
            if (window.confirm('Do you really want to delete this flight?')) {
                Flights.deleteFlight({id: flight.FlightId}).$promise
                    .then(() => {
                        if ($scope.selectedFlight === flight) {
                            $scope.cancel();
                        }
                        $scope.tableParams.reload();
                    })
                    .catch(_.partial(MessageManager.raiseError, 'delete', 'flight'));
            }
        };

        $scope.needsTowplane = function (startType) {
            return startType == 1;
        };

        function recalcCheckboxState() {
            $scope.flightTypeCheckbox = SoloFlightCheckboxEnablementCalculator.getSoloFlightCheckbox(
                $scope.selectedFlightType, $scope.flightDetails.GliderFlightDetailsData);
            if ($scope.flightTypeCheckbox.state === 'CHECKED') {
                $scope.flightDetails.GliderFlightDetailsData.CoPilotPersonId = undefined;
            }
        }

        $scope.flightTypeChanged = () => {
            $timeout(() => {
                for (let i = 0; i < $scope.gliderFlightTypes.length; i++) {
                    let t = $scope.gliderFlightTypes[i];
                    if (hasDetails() && t.FlightTypeId === $scope.flightDetails.GliderFlightDetailsData.FlightTypeId) {
                        $scope.selectedFlightType = t;
                        recalcCheckboxState();
                        calcNumberOfSeatWarning();
                    }
                }
            });
        };

        function createModalConfig(flags) {
            let flagsOrDefaults = flags || {
                    GliderPilot: true,
                    TowingPilot: false,
                    Passenger: false
                };
            return {
                template: require('../masterdata/persons/modal/add-person.html'),
                controller: AddPersonController,
                resolve: {
                    flags: () => {
                        return flagsOrDefaults;
                    }
                }
            };
        }

        $scope.newGliderPilot = () => {
            let modalInstance = $modal.open(createModalConfig({
                GliderPilot: true
            }));

            modalInstance.result.then(function (person) {
                $log.info(JSON.stringify(person));
                new PersonPersister(person).$save()
                    .then(function (res) {
                        console.log('successfully saved ' + JSON.stringify(res));
                        $scope.gliderPilots.push(res);
                        $scope.flightDetails.GliderFlightDetailsData.PilotPersonId = res.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'person'));
            });
        };

        $scope.newTowingPilot = () => {
            let modalInstance = $modal.open(createModalConfig({
                TowingPilot: true
            }));

            modalInstance.result.then(function (person) {
                $log.info(JSON.stringify(person));
                new PersonPersister(person).$save()
                    .then(function (res) {
                        console.log('successfully saved ' + JSON.stringify(res));
                        $scope.towingPilots.push(res);
                        $scope.flightDetails.TowFlightDetailsData.PilotPersonId = res.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'person'));
            });
        };

        $scope.newPassenger = () => {
            let modalInstance = $modal.open(createModalConfig({
                GliderPilot: false,
                Passenger: true
            }));

            modalInstance.result.then(function (passenger) {
                $log.info(JSON.stringify(passenger));
                new PassengerPersister(passenger).$save()
                    .then(function (savedPassenger) {
                        console.log('successfully saved ' + JSON.stringify(savedPassenger));
                        $scope.allPersons.push(savedPassenger);
                        $scope.flightDetails.GliderFlightDetailsData.PassengerPersonId = savedPassenger.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'passenger'));
            });
        };

        $scope.flightCostBalanceTypeChanged = () => {
            $timeout(() => {
                for (let i = 0; i < $scope.flightCostBalanceTypes.length; i++) {
                    if (hasDetails() && $scope.flightCostBalanceTypes[i].FlightCostBalanceTypeId == $scope.flightDetails.GliderFlightDetailsData.FlightCostBalanceType) {
                        $scope.PersonForInvoiceRequired = $scope.flightCostBalanceTypes[i].PersonForInvoiceRequired;
                    }
                }
            });
        };

        $scope.toggleSoloFlight = () => {
            if ($scope.selectedFlightType && $scope.flightDetails.CanUpdateRecord &&
                hasDetails() && !$scope.selectedFlightType.IsSoloFlight && !$scope.selectedFlightType.IsPassengerFlight) {
                $scope.flightDetails.GliderFlightDetailsData.IsSoloFlight = !$scope.flightDetails.GliderFlightDetailsData.IsSoloFlight;
                recalcCheckboxState();
            }
        };

        function calcNumberOfSeatWarning() {
            $scope.warnNumberOfSeatsInsufficientForFlightType = false;
            if ($scope.selectedFlightType && $scope.selectedGliderAircraft) {
                $scope.warnNumberOfSeatsInsufficientForFlightType = $scope.selectedGliderAircraft.NrOfSeats < $scope.selectedFlightType.MinNrOfAircraftSeatsRequired;
            }
        }

        function calcDurationWarning() {
            let gliderDuration = moment($scope.times.gliderDuration, format);
            let towDuration = moment($scope.times.towingDuration, format);
            if (gliderDuration.isValid() && towDuration.isValid()) {
                $scope.warnTowFlightLongerThanGliderFlight = gliderDuration.isBefore(towDuration);
            }
            else {
                $scope.warnTowFlightLongerThanGliderFlight = false;
            }
        }

        function calcDuration(from, to) {
            let toMoment = moment(to, format);
            let fromMoment = moment(from, format);
            if (toMoment.isValid() && fromMoment.isValid()) {
                return toMoment.subtract(fromMoment).format(format);
            }
        }

        function calcLanding(start, duration) {
            let startMoment = moment(start, format);
            let durationMoment = moment(duration, format);
            if (startMoment.isValid() && durationMoment.isValid()) {
                return startMoment.add(durationMoment).format(format);
            }
        }

        function findSelectedTowFlightLandingLocation() {
            for (let i = 0; i < $scope.locations.length; i++) {
                let location = $scope.locations[i];
                if (location.LocationId === ($scope.flightDetails.TowFlightDetailsData && $scope.flightDetails.TowFlightDetailsData.LdgLocationId)) {
                    return location;
                }
            }
            return {};
        }

        function findSelectedLandingLocation() {
            for (let i = 0; i < $scope.locations.length; i++) {
                let location = $scope.locations[i];
                if (location.LocationId === $scope.flightDetails.GliderFlightDetailsData.LdgLocationId) {
                    return location;
                }
            }
            return {};
        }

        function findSelectedStartLocation() {
            for (let i = 0; i < $scope.locations.length; i++) {
                let location = $scope.locations[i];
                if (location.LocationId === $scope.flightDetails.GliderFlightDetailsData.StartLocationId) {
                    return location;
                }
            }
            return {};
        }

        $scope.startLocationChanged = () => {
            $scope.flightDetails.GliderFlightDetailsData.LdgLocationId = $scope.flightDetails.GliderFlightDetailsData.StartLocationId;
            if ($scope.flightDetails.TowFlightDetailsData) {
                $scope.flightDetails.TowFlightDetailsData.LdgLocationId = $scope.flightDetails.GliderFlightDetailsData.StartLocationId;
            }
            recalcRouteRequirements();
        };

        $scope.gliderLandingLocationChanged = () => {
            recalcRouteRequirements();
        };

        $scope.towLandingLocationChanged = () => {
            recalcRouteRequirements();
        };

        $scope.startTypeChanged = () => {
            $timeout(() => {
                if (!$scope.flightDetails.TowFlightDetailsData && $scope.needsTowplane($scope.flightDetails.StartType)) {
                    $scope.flightDetails.TowFlightDetailsData = {};
                }
                $scope.selectedStartType = findSelectedStartType();
            }, 0);
        };

        function findSelectedStartType() {
            for (let i = 0; i < $scope.starttypes.length; i++) {
                let startType = $scope.starttypes[i];
                if (startType.StartTypeId == $scope.flightDetails.StartType) {
                    return startType;
                }
            }
        }

        function recalcRouteRequirements() {
            $timeout(() => {
                $scope.isOutboundRouteRequired = findSelectedStartLocation().IsOutboundRouteRequired;
                $scope.isInboundRouteRequired = findSelectedLandingLocation().IsInboundRouteRequired;
                $scope.isInboundRouteForTowFlightRequired = findSelectedTowFlightLandingLocation().IsInboundRouteRequired;
            }, 0);
        }

        $scope.formatGliderStart = () => {
            let times = $scope.times;
            times.gliderStart = this.TimeService.formatTime(times.gliderStart);
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
        };

        $scope.setGliderStart = () => {
            let times = $scope.times;
            times.gliderStart = $scope.getTimeNow();
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

        $scope.setGliderLanding = () => {
            let times = $scope.times;
            times.gliderLanding = $scope.getTimeNow();
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
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

        $scope.setTowLanding = () => {
            let times = $scope.times;
            times.towingLanding = $scope.getTimeNow();
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
            calcDurationWarning();
        };

        $scope.formatTowDuration = () => {
            let times = $scope.times;
            times.towingDuration = this.TimeService.formatTime(times.towingDuration);
            times.towingLanding = calcLanding(times.gliderStart, times.towingDuration);
            calcDurationWarning();
        };

        $scope.engineSecondsCountersChanged = () => {
            $scope.times.engineSecondsCounterDuration = Math.max(
                0,
                $scope.flightDetails.GliderFlightDetailsData.EngineEndOperatingCounterInSeconds
                - $scope.flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds
            );
        };

        $scope.copyLastCounterToStartOperatingCounter = () => {
            $scope.flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds = $scope.operatingCounters.EngineOperatingCounterInSeconds;
            $scope.engineSecondsCountersChanged();
        };

        $scope.cancel = () => {
            $location.path('/flights');
        };

        $scope.newFlight = () => {
            $location.path('/flights/new');
        };

        $scope.editFlight = (flight) => {
            $location.path('/flights/' + flight.FlightId);
        };

        $scope.copyFlight = (flight) => {
            $location.path('/flights/copy/' + flight.FlightId);
        };

        $scope.toggleGliderStartTimeInformation = () => {
            $scope.flightDetails.GliderFlightDetailsData.NoStartTimeInformation = !$scope.flightDetails.GliderFlightDetailsData.NoStartTimeInformation;
            $scope.flightDetails.TowFlightDetailsData.NoStartTimeInformation = $scope.flightDetails.GliderFlightDetailsData.NoStartTimeInformation;
            $scope.times.gliderStart = undefined;
        };

        $scope.toggleGliderLandingTimeInformation = () => {
            $scope.flightDetails.GliderFlightDetailsData.NoLdgTimeInformation = !$scope.flightDetails.GliderFlightDetailsData.NoLdgTimeInformation;
            $scope.times.gliderLanding = undefined;
        };

        $scope.toggleTowLandingTimeInformation = () => {
            $scope.flightDetails.TowFlightDetailsData.NoLdgTimeInformation = !$scope.flightDetails.TowFlightDetailsData.NoLdgTimeInformation;
            $scope.times.towingLanding = undefined;
        }

    }
}
