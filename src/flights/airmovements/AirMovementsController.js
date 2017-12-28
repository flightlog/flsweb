import moment from "moment";
import * as _ from "lodash";
import AddPersonController from "../../masterdata/persons/modal/AddPersonController";
import {FlightStateMapper} from "../FlightsServices";
import {TimerSet} from "../../core/TimerSet";
import AddAircraftController from "../../masterdata/aircrafts/modal/AddAircraftController";

export default class AirMovementsController {

    constructor($scope, $q, $timeout, TimeService, DropdownItemsRenderService, AuthService, $routeParams, NgTableParams, TableSettingsCacheFactory,
                $log, $modal, MessageManager, Aircraft,
                AirMovements, CounterUnitTypes, PagedFlights, $location,
                Locations, Persons, PersonsV2, PersonPersister, PassengerPersister, Aircrafts, FlightTypes,
                SpecificStartTypes, GLOBALS, Clubs, AircraftOperatingCounters, RoutesPerLocation) {
        const format = 'HH:mm';
        $scope.towPlaneImg = require('../../images/towplane.png');
        $scope.busy = true;
        $scope.debug = GLOBALS && GLOBALS.DEBUG;
        $scope.showChart = false;
        $scope.isClubAdmin = AuthService.isClubAdmin();

        $scope.starttypes = [];
        $scope.counterUnitTypes = [];
        $scope.locations = [];
        $scope.motorFlightTypes = [];
        $scope.motorAircrafts = [];
        $scope.motorPilots = [];
        $scope.observers = [];
        $scope.instructors = [];

        $scope.routeRequirements = {};
        $scope.timeSets = {};
        $scope.md = {};

        $scope.renderStarttype = DropdownItemsRenderService.starttypeRenderer();
        $scope.renderFlighttype = DropdownItemsRenderService.flighttypeRenderer();
        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderAircraft = DropdownItemsRenderService.aircraftRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();

        function calcDuration(from, to, useEngineCounterUnit) {
            let toMoment = moment(to, format);
            let fromMoment = moment(from, format);
            if (toMoment.isValid() && fromMoment.isValid()) {
                let duration = moment.duration(toMoment.diff(fromMoment));
                if (!useEngineCounterUnit || ($scope.operatingCounters && $scope.operatingCounters.EngineOperatingCounterUnitTypeKeyName == "Min")) {
                    return moment.utc(duration.asMilliseconds()).format(format);
                } else {
                    return Math.round(duration.asMilliseconds() / 36000.0) / 100;
                }
            }
        }

        function addDuration(from, duration) {
            let durationMoment = moment.utc(duration, format);
            let fromMoment = moment.utc(from, format);
            if (durationMoment.isValid() && fromMoment.isValid()) {
                return fromMoment.add(durationMoment.valueOf(), "milliseconds").format(format);
            }
        }

        $scope.reloadList = () => {
            reloadFlights();
        };

        let tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("AirMovementsController", {
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

        function reloadFlights() {
            if ($scope.tableParams) {
                $scope.tableParams.reload();
            } else {
                $scope.busy = false;
                $scope.tableParams = new NgTableParams(tableSettingsCache.currentSettings(), {
                    counts: [],
                    getData: function (params) {
                        $scope.busy = true;
                        let pageSize = params.count();
                        let pageStart = (params.page() - 1) * pageSize;
                        tableSettingsCache.update($scope.tableParams.filter(), $scope.tableParams.sorting());

                        let filterWithStates = Object.assign({}, FlightStateMapper.mapFlightState($scope.tableParams.filter()));
                        delete filterWithStates._flightState;

                        let sortingWithStates = FlightStateMapper.flightStateSorting($scope.tableParams.sorting());

                        return PagedFlights.getMotorFlights(filterWithStates, sortingWithStates, pageStart, pageSize)
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
        }

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
            reloadFlights();
        }

        function hasDetails() {
            return $scope.flightDetails && $scope.flightDetails.MotorFlightDetailsData !== undefined;
        }

        $scope.motorAircraftSelectionChanged = (resetEngineOperatingCounters) => {
            $timeout(() => {
                if (hasDetails()) {
                    $scope.motorRegistration = '';
                    if (resetEngineOperatingCounters) {
                        $scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds = undefined;
                        $scope.flightDetails.MotorFlightDetailsData.EngineEndOperatingCounterInSeconds = undefined;
                    }
                    if ($scope.flightDetails && $scope.motorAircrafts) {
                        for (let i = 0; i < $scope.motorAircrafts.length; i++) {
                            let motorAircraft = $scope.motorAircrafts[i];
                            if (motorAircraft.AircraftId === ($scope.flightDetails.MotorFlightDetailsData && $scope.flightDetails.MotorFlightDetailsData.AircraftId)) {
                                $scope.flightDetails.MotorFlightDetailsData.AircraftId = motorAircraft.AircraftId;
                                $scope.motorRegistration = motorAircraft.Immatriculation.substring(motorAircraft.Immatriculation.indexOf('-') + 2);

                                AircraftOperatingCounters.query({AircraftId: motorAircraft.AircraftId}).$promise.then((result) => {
                                    $scope.operatingCounters = result;
                                    $scope.times.LastEngineOperatingCounterFormatted = TimeService.formatSecondsToLongHoursFormat(
                                        $scope.operatingCounters.EngineOperatingCounterInSeconds,
                                        $scope.operatingCounters.EngineOperatingCounterUnitTypeKeyName
                                    );
                                    $scope.times.motorDuration = calcDuration($scope.times.motorStart, $scope.times.motorLanding);
                                    $scope.times.blockDuration = calcDuration($scope.times.blockTimeStart, $scope.times.blockTimeEnd);

                                    $scope.timeSets.engine = new TimerSet("engine", $scope.operatingCounters.EngineOperatingCounterUnitTypeKeyName);
                                    $scope.timeSets.engine.setStartSeconds($scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds);
                                    $scope.timeSets.engine.setEndSeconds($scope.flightDetails.MotorFlightDetailsData.EngineEndOperatingCounterInSeconds);

                                    $scope.engineSecondsCountersChanged();
                                }).catch(_.partial(MessageManager.raiseError, 'load', 'operating counters'));
                            }
                        }
                    }
                }
            }, 0);
        };

        function initForNewFlight(flightDetails) {
            Clubs.getMyClub().$promise.then((result) => {
                $scope.myClub = result;
                flightDetails.MotorFlightDetailsData.StartLocationId = flightDetails.MotorFlightDetailsData.StartLocationId || $scope.myClub.HomebaseId;
                flightDetails.MotorFlightDetailsData.LdgLocationId = flightDetails.MotorFlightDetailsData.LdgLocationId || $scope.myClub.HomebaseId;
                flightDetails.MotorFlightDetailsData.FlightTypeId = flightDetails.MotorFlightDetailsData.FlightTypeId || $scope.myClub.DefaultMotorFlightTypeId;
                flightDetails.StartType = flightDetails.StartType || $scope.myClub.DefaultStartType || 5;

                $scope.recalcRouteRequirements();
            });
            flightDetails.CanUpdateRecord = true;

            return flightDetails;
        }

        function loadFlight(flightId) {
            return AirMovements.getFlight({id: flightId}).$promise;
        }

        function newFlight() {
            return $q.when(initForNewFlight({
                MotorFlightDetailsData: {}
            }));
        }

        function copyFlight(flightId) {
            return loadFlight(flightId)
                .then((res) => {
                    let flightDetails = {};
                    flightDetails.FlightDate = res.FlightDate;
                    flightDetails.StartType = res.StartType;
                    flightDetails.FlightId = undefined;
                    flightDetails.MotorFlightDetailsData = res.MotorFlightDetailsData || {};
                    flightDetails.MotorFlightDetailsData.FlightId = undefined;
                    flightDetails.MotorFlightDetailsData.StartDateTime = undefined;
                    flightDetails.MotorFlightDetailsData.LdgDateTime = undefined;
                    flightDetails.MotorFlightDetailsData.FlightComment = undefined;
                    flightDetails.MotorFlightDetailsData.BlockStartDateTime = undefined;
                    flightDetails.MotorFlightDetailsData.BlockEndDateTime = undefined;
                    flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds = undefined;
                    flightDetails.MotorFlightDetailsData.EngineEndOperatingCounterInSeconds = undefined;

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
            let promises = [];
            promises.push(PersonsV2.getAllPersons().$promise.then((result) => {
                angular.copy(result, $scope.allPersons);
            }));
            promises.push(Persons.getMotorPilots().$promise.then((result) => {
                angular.copy(result, $scope.motorPilots);
            }));
            promises.push(Persons.getMotorInstructors().$promise.then((result) => {
                angular.copy(result, $scope.instructors);
            }));
            promises.push(Locations.getLocations().$promise.then((result) => {
                angular.copy(result, $scope.locations);
            }));
            promises.push(Aircrafts.getMotorPlanes().$promise.then((result) => {
                angular.copy(result, $scope.motorAircrafts);
            }));
            promises.push(SpecificStartTypes.queryStartTypesFor({kind: "motor"}).$promise.then((result) => {
                angular.copy(result, $scope.starttypes);
            }));
            promises.push(CounterUnitTypes.query().$promise.then((result) => {
                angular.copy(result, $scope.counterUnitTypes);
            }));
            promises.push(FlightTypes.queryFlightTypesFor({dest: 'motor'}).$promise.then((result) => {
                angular.copy(result, $scope.motorFlightTypes);
            }));
            promises.push(Clubs.getMyClub().$promise.then((result) => {
                $scope.myClub = result;
            }));
            return $q.all(promises);
        }


        function mapFlightToForm(result) {
            $scope.flightDetails = result;

            let motorFlight = $scope.flightDetails.MotorFlightDetailsData;

            $scope.times = {
                motorStart: TimeService.time(motorFlight.StartDateTime),
                motorLanding: TimeService.time(motorFlight.LdgDateTime),
                blockTimeStart: TimeService.time(motorFlight.BlockStartDateTime),
                blockTimeEnd: TimeService.time(motorFlight.BlockEndDateTime),
                engineCounterFormat: 'seconds'
            };
            $scope.flightDetails.FlightDate = $scope.flightDetails.FlightDate || (motorFlight.StartDateTime || motorFlight.FlightDate) || (!result.FlightId && new Date());

            $scope.motorAircraftSelectionChanged(false);
            $scope.flightTypeChanged();
            $scope.recalcRouteRequirements();
            $scope.busy = false;
        }

        $scope.save = (flightDetails) => {
            MessageManager.reset();
            let flightDate = moment(flightDetails.FlightDate).format("DD.MM.YYYY");
            flightDetails.MotorFlightDetailsData.StartDateTime = TimeService.parseDateTime(flightDate, $scope.times.motorStart);
            flightDetails.MotorFlightDetailsData.LdgDateTime = TimeService.parseDateTime(flightDate, $scope.times.motorLanding);
            flightDetails.MotorFlightDetailsData.BlockStartDateTime = TimeService.parseDateTime(flightDate, $scope.times.blockTimeStart);
            flightDetails.MotorFlightDetailsData.BlockEndDateTime = TimeService.parseDateTime(flightDate, $scope.times.blockTimeEnd);

            if (flightDetails.FlightId) {
                new AirMovements(flightDetails).$saveFlight({id: flightDetails.FlightId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'flight'));
            } else {
                new AirMovements(flightDetails).$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'flight'));
            }
        };

        $scope.delete = function (flight) {
            if (window.confirm('Do you really want to delete this flight?')) {
                AirMovements.deleteFlight({id: flight.FlightId}).$promise
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

        $scope.flightTypeChanged = () => {
            $timeout(() => {
                for (let i = 0; i < $scope.motorFlightTypes.length; i++) {
                    let t = $scope.motorFlightTypes[i];
                    if (hasDetails() && t.FlightTypeId === $scope.flightDetails.MotorFlightDetailsData.FlightTypeId) {
                        $scope.selectedFlightType = t;
                    }
                }
            }, 0);
        };

        function createModalConfig(flags) {
            let flagsOrDefaults = flags || {
                MotorPilot: true
            };
            return {
                template: require('../../masterdata/persons/modal/add-person.html'),
                controller: AddPersonController,
                resolve: {
                    flags: () => {
                        return flagsOrDefaults;
                    }
                }
            };
        }

        $scope.newMotorPilot = () => {
            let modalInstance = $modal.open(createModalConfig({
                MotorPilot: true
            }));

            modalInstance.result.then(function (person) {
                $log.info(JSON.stringify(person));
                new PersonPersister(person).$save()
                    .then(function (res) {
                        console.log('successfully saved ' + JSON.stringify(res));
                        $scope.motorPilots.push(res);
                        $scope.flightDetails.MotorFlightDetailsData.PilotPersonId = res.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'person'));
            });
        };


        $scope.newAircraft = () => {
            let modalInstance = $modal.open({
                template: require('../../masterdata/aircrafts/modal/add-aircraft.html'),
                controller: AddAircraftController,
                resolve: {
                    aircraftTypeIds: () => [4, 8, 16, 32]
                }
            });

            modalInstance.result.then((aircraft) => {
                new Aircraft(aircraft).$save()
                    .then((savedAircraft) => {
                        $scope.motorAircrafts.push(savedAircraft);
                        $scope.flightDetails.MotorFlightDetailsData.AircraftId = savedAircraft.AircraftId;
                    })
                    .then(Aircraft.invalidate)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'aircraft'));
            });
        };

        $scope.newPassenger = () => {
            let modalInstance = $modal.open(createModalConfig({
                MotorPilot: false,
                Passenger: true
            }));

            modalInstance.result.then(function (passenger) {
                $log.info(JSON.stringify(passenger));
                new PassengerPersister(passenger).$save()
                    .then(function (savedPassenger) {
                        console.log('successfully saved ' + JSON.stringify(savedPassenger));
                        $scope.allPersons.push(savedPassenger);
                        $scope.flightDetails.MotorFlightDetailsData.PassengerPersonId = savedPassenger.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'passenger'));
            });
        };

        function findSelectedLandingLocation() {
            for (let i = 0; i < $scope.locations.length; i++) {
                let location = $scope.locations[i];
                if (location.LocationId === $scope.flightDetails.MotorFlightDetailsData.LdgLocationId) {
                    return location;
                }
            }
            return {};
        }

        function findSelectedStartLocation() {
            for (let i = 0; i < $scope.locations.length; i++) {
                let location = $scope.locations[i];
                if (location.LocationId === $scope.flightDetails.MotorFlightDetailsData.StartLocationId) {
                    return location;
                }
            }
            return {};
        }

        $scope.recalcRouteRequirements = () => {
            $timeout(() => {
                let selectedStartLocation = findSelectedStartLocation();
                let selectedLandingLocation = findSelectedLandingLocation();

                RoutesPerLocation.getOutboundRoutes(selectedStartLocation)
                    .then((result) => {
                        $scope.md.startLocationOutboundRoutes = result;
                    });
                RoutesPerLocation.getInboundRoutes(selectedLandingLocation)
                    .then((result) => {
                        $scope.md.landingLocationInboundRoutes = result;
                    });

                $scope.routeRequirements.isOutboundRouteRequired = selectedStartLocation.IsOutboundRouteRequired;
                $scope.routeRequirements.isInboundRouteRequired = selectedLandingLocation.IsInboundRouteRequired;
            }, 0);
        };

        $scope.formatMotorStart = () => {
            let times = $scope.times;
            times.motorStart = TimeService.formatTime(times.motorStart);
            times.motorDuration = calcDuration(times.motorStart, times.motorLanding);
        };

        $scope.formatMotorLanding = () => {
            let times = $scope.times;
            times.motorLanding = TimeService.formatTime(times.motorLanding);
            times.motorDuration = calcDuration(times.motorStart, times.motorLanding);
            $scope.flightDetails.MotorFlightDetailsData.NrOfLdgs = $scope.flightDetails.MotorFlightDetailsData.NrOfLdgs || 1;
        };

        $scope.formatMotorDuration = () => {
            let times = $scope.times;
            times.motorDuration = TimeService.formatTime(times.motorDuration);
            times.motorLanding = addDuration(times.motorStart, times.motorDuration);
        };

        $scope.setMotorStart = () => {
            let times = $scope.times;
            times.motorStart = $scope.getTimeNow();
            times.motorDuration = calcDuration(times.motorStart, times.motorLanding);
        };

        $scope.setMotorLanding = () => {
            let times = $scope.times;
            times.motorLanding = $scope.getTimeNow();
            times.motorDuration = calcDuration(times.motorStart, times.motorLanding);
        };

        $scope.setBlockTimeStart = () => {
            let times = $scope.times;
            times.blockTimeStart = times.motorStart;
            times.blockDuration = calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.suggestBlockTimeStart = () => {
            let times = $scope.times;
            times.blockTimeStart = moment(times.motorStart, format).subtract(5, "minutes").format(format);
            times.blockDuration = calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.setBlockTimeEnd = () => {
            let times = $scope.times;
            times.blockTimeEnd = times.motorLanding;
            times.blockDuration = calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.suggestBlockTimeEnd = () => {
            let times = $scope.times;
            times.blockTimeEnd = moment(times.motorLanding, format).add(5, "minutes").format(format);
            times.blockDuration = calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.formatBlockTimeStart = () => {
            let times = $scope.times;
            times.blockTimeStart = TimeService.formatTime(times.blockTimeStart);
            times.blockDuration = calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.formatBlockTimeEnd = () => {
            let times = $scope.times;
            times.blockTimeEnd = TimeService.formatTime(times.blockTimeEnd);
            times.blockDuration = calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.formatBlockDuration = () => {
            let times = $scope.times;
            times.blockDuration = TimeService.formatTime(times.blockDuration);
            times.blockTimeEnd = addDuration(times.blockTimeStart, times.blockDuration);
        };

        $scope.formatEngineCounterDuration = () => {
            let durationSeconds = $scope.times.engineSecondsCounterDuration;
            if (!isNaN($scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds)
                && !isNaN(durationSeconds)) {
                $scope.flightDetails.MotorFlightDetailsData.EngineEndOperatingCounterInSeconds = $scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds + durationSeconds;
            }
        };

        $scope.engineSecondsCountersChanged = () => {
            $scope.timeSets.engine.setStartSeconds($scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds);
            $scope.timeSets.engine.setEndSeconds($scope.flightDetails.MotorFlightDetailsData.EngineEndOperatingCounterInSeconds);
            $scope.times.engineSecondsCounterDuration = $scope.timeSets.engine.durationSeconds;
        };

        $scope.copyLastCounterToStartOperatingCounter = () => {
            $scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds = $scope.operatingCounters.EngineOperatingCounterInSeconds;
            $scope.engineSecondsCountersChanged();
        };

        $scope.cancel = () => {
            $location.path('/airmovements');
        };

        $scope.newFlight = () => {
            $location.path('/airmovements/new');
        };

        $scope.editFlight = (flight) => {
            $location.path('/airmovements/' + flight.FlightId);
        };

        $scope.copyFlight = (flight) => {
            $location.path('/airmovements/copy/' + flight.FlightId);
        };

        $scope.togglMotorStartTimeInformation = () => {
            $scope.flightDetails.MotorFlightDetailsData.NoStartTimeInformation = !$scope.flightDetails.MotorFlightDetailsData.NoStartTimeInformation;
            $scope.times.motorStart = undefined;
        };

        $scope.togglMotorLandingTimeInformation = () => {
            $scope.flightDetails.MotorFlightDetailsData.NoLdgTimeInformation = !$scope.flightDetails.MotorFlightDetailsData.NoLdgTimeInformation;
            $scope.times.motorLanding = undefined;
        };

    }
}
