import moment from "moment";
import * as _ from "lodash";
import AddPersonController from "../masterdata/persons/modal/AddPersonController";
import {FlightStateMapper} from "./FlightsServices";
import AddAircraftController from "../masterdata/aircrafts/modal/AddAircraftController";

export default class FlightsController {
    constructor($scope, $q, $log, $http, $modal, $translate, $timeout, MessageManager, $location, $routeParams,
                TimeService, Flights, NgTableParams, PagedFlights, AuthService,
                FlightTypes, Locations, Persons, PersonsV2, PersonPersister, PassengerPersister,
                Aircrafts, StartTypes, GLOBALS, FlightCostBalanceTypes, TableSettingsCacheFactory,
                SoloFlightCheckboxEnablementCalculator, Clubs, AircraftOperatingCounters, DropdownItemsRenderService,
                localStorageService, RoutesPerLocation, Aircraft) {
        $scope.busy = true;
        this.TimeService = TimeService;

        if (!localStorageService.get("towPilotByAircraftId")) {
            localStorageService.set("towPilotByAircraftId", {});
        }

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
        $scope.md = {};

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
                                        $scope.times.lastOperatingCounterFormatted = TimeService.formatSecondsToLongHoursFormat(
                                            $scope.operatingCounters.EngineOperatingCounterInSeconds,
                                            $scope.operatingCounters.EngineOperatingCounterUnitTypeKeyName
                                        );
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

        $scope.copyTowingFromLast = () => {
            let flightDetails = $scope.flightDetails;
            flightDetails.TowFlightDetailsData.AircraftId = flightDetails.TowFlightDetailsData.AircraftId || localStorageService.get("lastTowAircraftId");
            if (flightDetails.TowFlightDetailsData.AircraftId) {
                flightDetails.TowFlightDetailsData.PilotPersonId = localStorageService.get("towPilotByAircraftId")[flightDetails.TowFlightDetailsData.AircraftId] || flightDetails.TowFlightDetailsData.PilotPersonId;
            }
        };

        function resetTowFlightDefaults() {
            let flightDetails = $scope.flightDetails;
            flightDetails.TowFlightDetailsData.StartLocationId = flightDetails.TowFlightDetailsData.StartLocationId || $scope.myClub.HomebaseId;
            flightDetails.TowFlightDetailsData.LdgLocationId = flightDetails.TowFlightDetailsData.LdgLocationId || $scope.myClub.HomebaseId;
            flightDetails.TowFlightDetailsData.FlightTypeId = flightDetails.TowFlightDetailsData.FlightTypeId || $scope.myClub.DefaultTowFlightTypeId;
            flightDetails.TowFlightDetailsData.NrOfLdgs = 1;
        }

        $scope.towingAircraftSelectionChanged = () => {
            $timeout(() => {
                if (hasDetails()) {
                    $scope.towplaneRegistration = '';
                    if ($scope.flightDetails && $scope.towerAircrafts) {
                        for (let i = 0; i < $scope.towerAircrafts.length; i++) {
                            let tow = $scope.towerAircrafts[i];
                            if (tow.AircraftId === ($scope.flightDetails.TowFlightDetailsData && $scope.flightDetails.TowFlightDetailsData.AircraftId)) {
                                $scope.flightDetails.TowFlightDetailsData.AircraftId = tow.AircraftId;
                                $scope.towplaneRegistration = tow.Immatriculation.substring(tow.Immatriculation.indexOf('-') + 1);

                                if (!$scope.myClub) {
                                    Clubs.getMyClub().$promise
                                        .then((result) => {
                                            $scope.myClub = result;
                                            resetTowFlightDefaults();
                                        });
                                } else {
                                    resetTowFlightDefaults();
                                }
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
                    flightDetails.StartType = flightDetails.StartType || $scope.myClub.DefaultStartType || "1";

                    flightDetails.GliderFlightDetailsData.StartLocationId = flightDetails.GliderFlightDetailsData.StartLocationId || localStorageService.get("lastStartLocation") || $scope.myClub.HomebaseId;
                    flightDetails.GliderFlightDetailsData.LdgLocationId = flightDetails.GliderFlightDetailsData.LdgLocationId || localStorageService.get("lastStartLocation") || $scope.myClub.HomebaseId;
                    flightDetails.GliderFlightDetailsData.FlightTypeId = flightDetails.GliderFlightDetailsData.FlightTypeId || $scope.myClub.DefaultGliderFlightTypeId;
                    flightDetails.GliderFlightDetailsData.NrOfLdgs = 1;

                    flightDetails.TowFlightDetailsData.StartLocationId = flightDetails.TowFlightDetailsData.StartLocationId || localStorageService.get("lastStartLocation") || $scope.myClub.HomebaseId;
                    flightDetails.TowFlightDetailsData.LdgLocationId = flightDetails.TowFlightDetailsData.LdgLocationId || localStorageService.get("lastStartLocation") || $scope.myClub.HomebaseId;

                    deferred.resolve(flightDetails);
                })
                .catch((reason) => {
                    deferred.reject(reason);
                });

            return deferred.promise;
        }

        $scope.copyRouteFromLast = (towFlightDetailsData, routeField, localStorageField) => {
            towFlightDetailsData[routeField] = localStorageService.get(localStorageField);
        };

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

        function prepareForSaving(flightDetails) {
            if (flightDetails.TowFlightDetailsData && flightDetails.TowFlightDetailsData.AircraftId) {
                let towPilotByAircraftId = localStorageService.get("towPilotByAircraftId");
                towPilotByAircraftId[flightDetails.TowFlightDetailsData.AircraftId] = flightDetails.TowFlightDetailsData.PilotPersonId;
                localStorageService.set("towPilotByAircraftId", towPilotByAircraftId);
                localStorageService.set("lastTowAircraftId", flightDetails.TowFlightDetailsData.AircraftId);
                localStorageService.set("lastTowOutbound", flightDetails.TowFlightDetailsData.OutboundRoute);
                localStorageService.set("lastTowInbound", flightDetails.TowFlightDetailsData.InboundRoute);
            }
            localStorageService.set("lastGliderOutbound", flightDetails.GliderFlightDetailsData.OutboundRoute);
            localStorageService.set("lastGliderInbound", flightDetails.GliderFlightDetailsData.InboundRoute);
            localStorageService.set("lastStartLocation", flightDetails.GliderFlightDetailsData.StartLocationId);

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
        }

        function doSave(flightDetails, callback) {
            if (flightDetails.FlightId) {
                new Flights(flightDetails).$saveFlight({id: flightDetails.FlightId})
                    .then(callback)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'flight'));
            } else {
                new Flights(flightDetails).$save()
                    .then(callback)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'flight'));
            }
        }

        $scope.save = (flightDetails) => {
            prepareForSaving(flightDetails);
            doSave(flightDetails, $scope.cancel);
        };

        $scope.saveAndCopy = (flightDetails) => {
            prepareForSaving(flightDetails);
            doSave(flightDetails, savedFlight => {
                $scope.copyFlight(savedFlight);
            });
        };

        $scope.delete = function (flight) {
            if (window.confirm('Do you really want to delete this flight?')) {
                Flights.deleteFlight({id: flight.FlightId}).$promise
                    .then(() => {
                        if ($scope.flightDetails === flight) {
                            $scope.cancel();
                        } else if ($scope.tableParams) {
                            $scope.tableParams.reload();
                        }
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

        function newAircraft(allowedAircraftTypeIds, callback) {
            let modalInstance = $modal.open({
                template: require('../masterdata/aircrafts/modal/add-aircraft.html'),
                controller: AddAircraftController,
                resolve: {
                    aircraftTypeIds: () => allowedAircraftTypeIds
                }
            });

            modalInstance.result.then((aircraft) => {
                new Aircraft(aircraft).$save()
                    .then(callback)
                    .then(Aircraft.invalidate)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'aircraft'));
            });
        }

        $scope.newGliderAircraft = () => {
            newAircraft(
                [1, 2, 4],
                (savedAircraft) => {
                    $scope.gliderAircrafts.push(savedAircraft);
                    $scope.flightDetails.GliderFlightDetailsData.AircraftId = savedAircraft.AircraftId;
                    $scope.gliderAircraftSelectionChanged(true);
                });
        };

        $scope.newTowAircraft = () => {
            newAircraft(
                [4, 8, 16, 32],
                (savedAircraft) => {
                    $scope.towerAircrafts.push(savedAircraft);
                    $scope.flightDetails.TowFlightDetailsData.AircraftId = savedAircraft.AircraftId;
                    $scope.towingAircraftSelectionChanged();
                });
        };

        function newPerson(persisterConstructor, dialogConfig, callback) {
            let modalInstance = $modal.open(createModalConfig(dialogConfig));

            modalInstance.result.then((passenger) => {
                new persisterConstructor(passenger).$save()
                    .then(callback)
                    .then(PassengerPersister.invalidate)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'person'));
            });
        }

        $scope.newGliderPilot = () => {
            newPerson(
                PersonPersister,
                {
                    GliderPilot: true
                },
                (person) => {
                    $scope.gliderPilots.push(person);
                    $scope.flightDetails.GliderFlightDetailsData.PilotPersonId = person.PersonId;
                }
            );
        };

        $scope.newTowingPilot = () => {
            newPerson(
                PersonPersister,
                {
                    TowingPilot: true
                },
                (person) => {
                    $scope.towingPilots.push(person);
                    $scope.flightDetails.TowFlightDetailsData.PilotPersonId = person.PersonId;
                }
            );
        };

        $scope.newPassenger = () => {
            newPerson(
                PassengerPersister,
                {
                    GliderPilot: false,
                    Passenger: true
                },
                (person) => {
                    $scope.allPersons.push(person);
                    $scope.flightDetails.GliderFlightDetailsData.PassengerPersonId = person.PersonId;
                }
            );
        };

        $scope.newInvoiceRecipient = () => {
            newPerson(
                PassengerPersister,
                {
                    GliderPilot: false,
                    Passenger: true
                },
                (person) => {
                    $scope.allPersons.push(person);
                    $scope.flightDetails.GliderFlightDetailsData.InvoiceRecipientPersonId = person.PersonId;
                }
            );
        };

        $scope.flightCostBalanceTypeChanged = () => {
            $timeout(() => {
                for (let i = 0; i < $scope.flightCostBalanceTypes.length; i++) {
                    if (hasDetails() && $scope.flightCostBalanceTypes[i].FlightCostBalanceTypeId == $scope.flightDetails.GliderFlightDetailsData.FlightCostBalanceType) {
                        $scope.PersonForInvoiceRequired = $scope.flightCostBalanceTypes[i].PersonForInvoiceRequired;
                        if (!$scope.PersonForInvoiceRequired) {
                            $scope.flightDetails.GliderFlightDetailsData.InvoiceRecipientPersonId = undefined;
                        }
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
                let d = moment.duration(toMoment.diff(fromMoment));

                return moment.utc(d.asMilliseconds()).format(format);
            }
        }

        function calcLanding(start, duration) {
            let startMoment = moment.utc(start, format);
            let durationMoment = moment.utc(duration, format);
            if (startMoment.isValid() && durationMoment.isValid()) {
                return startMoment.add(durationMoment.unix(), "seconds").format(format);
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
                $scope.flightDetails.TowFlightDetailsData.StartLocationId = $scope.flightDetails.GliderFlightDetailsData.StartLocationId;
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
                let selectedStartLocation = findSelectedStartLocation();
                let selectedLandingLocation = findSelectedLandingLocation();
                let selectedTowFlightLandingLocation = findSelectedTowFlightLandingLocation();

                RoutesPerLocation.getOutboundRoutes(selectedStartLocation)
                    .then((result) => {
                        $scope.md.startLocationOutboundRoutes = result;
                    });
                RoutesPerLocation.getInboundRoutes(selectedLandingLocation)
                    .then((result) => {
                        $scope.md.landingLocationInboundRoutes = result;
                    });
                RoutesPerLocation.getInboundRoutes(selectedTowFlightLandingLocation)
                    .then((result) => {
                        $scope.md.towLandingLocationInboundRoutes = result;
                    });

                $scope.isOutboundRouteRequired = selectedStartLocation.IsOutboundRouteRequired;
                $scope.isInboundRouteRequired = selectedLandingLocation.IsInboundRouteRequired;
                $scope.isInboundRouteForTowFlightRequired = selectedTowFlightLandingLocation.IsInboundRouteRequired;
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
            if ($scope.flightDetails.GliderFlightDetailsData.EngineEndOperatingCounterInSeconds && $scope.flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds) {
                $scope.times.engineSecondsCounterDuration = Math.max(
                    0,
                    $scope.flightDetails.GliderFlightDetailsData.EngineEndOperatingCounterInSeconds
                    - $scope.flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds
                );
            } else {
                $scope.times.engineSecondsCounterDuration = undefined;
            }
        };

        $scope.formatEngineCounterDuration = () => {
            let durationSeconds = $scope.times.engineSecondsCounterDuration;
            if (!isNaN($scope.flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds)
                && !isNaN(durationSeconds)) {
                $scope.flightDetails.GliderFlightDetailsData.EngineEndOperatingCounterInSeconds = $scope.flightDetails.GliderFlightDetailsData.EngineStartOperatingCounterInSeconds + durationSeconds;
            }
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
        };

        $scope.validateFlights = () => {
            if (confirm($translate.instant("CONFIRM_VALIDATE"))) {
                $scope.busy = true;
                $http.post(`${GLOBALS.BASE_URL}/api/v1/flights/validate`, {})
                    .then(() => {
                        if ($scope.tableParams) {
                            $scope.tableParams.reload();
                        } else {
                            $scope.cancel();
                        }
                    })
                    .catch(_.partial(MessageManager.raiseError, 'validate', 'flights'))
                    .finally(() => {
                        $scope.busy = false;
                    });
            }
        };

    }
}
