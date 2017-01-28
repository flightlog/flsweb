import moment from "moment";
import * as _ from "lodash";
import AddPersonController from "../../masterdata/persons/modal/AddPersonController";

export default class AirMovementsController {

    constructor($scope, $q, $timeout, TimeService, DropdownItemsRenderService, AuthService, $routeParams, NgTableParams,
                $log, $modal, MessageManager,
                AirMovements, CounterUnitTypes, PagedFlights, $location,
                Locations, Persons, PersonsV2, PersonPersister, PassengerPersister, Aircrafts, FlightTypes,
                SpecificStartTypes, GLOBALS, Clubs, AircraftOperatingCounters) {
        const format = 'HH:mm';
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
        $scope.filterDates = {};
        $scope.routeRequirements = {};

        $scope.renderStarttype = DropdownItemsRenderService.starttypeRenderer();
        $scope.renderFlighttype = DropdownItemsRenderService.flighttypeRenderer();
        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderAircraft = DropdownItemsRenderService.aircraftRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();

        let today = moment();

        $scope.filterDates.fromDate = today;
        $scope.filterDates.toDate = today;

        function calcDuration(from, to) {
            let toMoment = moment(to, format);
            let fromMoment = moment(from, format);
            if (toMoment.isValid() && fromMoment.isValid()) {
                return toMoment.subtract(fromMoment).format(format);
            }
        }

        $scope.loadAllTime = () => {
            $scope.filterDates.fromDate = '';
            $scope.filterDates.toDate = today;
            reloadFlights();
        };
        $scope.loadMonths = function (num) {
            $scope.filterDates.fromDate = moment().subtract(num, 'months');
            $scope.filterDates.toDate = today;
            reloadFlights();
        };
        $scope.loadMonth = function (num) {
            $scope.filterDates.fromDate = moment().startOf('month').subtract(num, 'months');
            $scope.filterDates.toDate = moment().startOf('month').subtract(num - 1, 'months');
            reloadFlights();
        };
        $scope.loadToday = () => {
            $scope.filterDates.fromDate = today;
            $scope.filterDates.toDate = today;
            reloadFlights();
        };
        $scope.loadYesterday = () => {
            $scope.filterDates.fromDate = moment().subtract(1, 'days');
            $scope.filterDates.toDate = $scope.filterDates.fromDate;
            reloadFlights();
        };

        $scope.reloadList = () => {
            reloadFlights();
        };

        function reloadFlights() {
            $scope.busy = false;
            $scope.tableParams = new NgTableParams({
                filter: {},
                sorting: {
                    StartDateTime: 'desc'
                },
                count: 100
            }, {
                counts: [],
                getData: function (params) {
                    $scope.busy = true;
                    let pageSize = params.count();
                    let pageStart = (params.page() - 1) * pageSize;

                    return PagedFlights.getMotorFlights($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                        .then((result) => {
                            $scope.busy = false;
                            params.total(result.TotalRows);
                            let flights = result.Items;
                            for (var i = 0; i < result.length; i++) {
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


        if ($routeParams.id !== undefined) {
            loadMasterdata()
                .then(() => {
                    if ($routeParams.id === 'new') {
                        $scope.newFlight = {};
                        return selectFlight($scope.newFlight);
                    } else {
                        return selectFlight({FlightId: $routeParams.id});
                    }
                })
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
            });
            flightDetails.CanUpdateRecord = true;
            return flightDetails;
        }

        function loadFlight(flight, toBeCopied) {
            if (flight.FlightId) {
                return AirMovements.getFlight({id: flight.FlightId}).$promise;
            }
            if (toBeCopied) {
                return AirMovements.getFlight({id: toBeCopied.FlightId}).$promise
                    .then((res) => {
                        let flightDetails = {};
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
            } else {
                return $q.when(initForNewFlight({
                    MotorFlightDetailsData: {}
                }));
            }
        }

        $scope.getTimeNow = () => {
            if (!$scope.times.flightDate) {
                $scope.times.flightDate = new Date();
            }
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


        function selectFlight(flight, toBeCopied) {
            $scope.operatingCounters = undefined;
            $scope.PersonForInvoiceRequired = false;

            return loadFlight(flight, toBeCopied)
                .then((result) => {
                    $scope.flightDetails = result;

                    let motorFlight = $scope.flightDetails.MotorFlightDetailsData;

                    $scope.times = {
                        flightDate: (motorFlight.StartDateTime || motorFlight.FlightDate) || new Date(),
                        motorStart: TimeService.time(motorFlight.StartDateTime),
                        motorLanding: TimeService.time(motorFlight.LdgDateTime),
                        blockTimeStart: TimeService.time(motorFlight.BlockStartDateTime),
                        blockTimeEnd: TimeService.time(motorFlight.BlockEndDateTime),
                        engineCounterFormat: 'seconds'
                    };
                    $scope.times.motorDuration = calcDuration($scope.times.motorStart, $scope.times.motorLanding);
                    $scope.times.blockDuration = calcDuration($scope.times.blockTimeStart, $scope.times.blockTimeEnd);

                    Aircrafts.getTowingPlanes().$promise.then((result) => {
                        $scope.motorAircrafts = result;
                        $scope.motorAircraftSelectionChanged(false);
                    });
                })
                .then(() => {
                    $scope.flightTypeChanged();
                    $scope.recalcRouteRequirements();
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'flight'))
                .finally(() => {
                    $scope.busyLoadingFlight = false;
                    $scope.busy = $scope.loadingMasterdata;
                });
        }

        $scope.cancel = () => {
            $location.path('/airmovements');
        };

        $scope.new = (toBeCopied) => {
            $location.path('/airmovements/new');
        };

        $scope.save = (flightDetails) => {
            MessageManager.reset();
            $scope.busyLoadingFlight = true;
            var flightDate = moment($scope.times.flightDate).format("DD.MM.YYYY");
            flightDetails.MotorFlightDetailsData.StartDateTime = TimeService.parseDateTime(flightDate, $scope.times.motorStart);
            flightDetails.MotorFlightDetailsData.LdgDateTime = TimeService.parseDateTime(flightDate, $scope.times.motorLanding);
            flightDetails.MotorFlightDetailsData.BlockStartDateTime = TimeService.parseDateTime(flightDate, $scope.times.blockTimeStart);
            flightDetails.MotorFlightDetailsData.BlockEndDateTime = TimeService.parseDateTime(flightDate, $scope.times.blockTimeEnd);

            if (flightDetails.FlightId) {
                new AirMovements(flightDetails).$saveFlight({id: flightDetails.FlightId})
                    .then(reloadFlights)
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'flight'))
                    .finally(() => {
                        $scope.busyLoadingFlight = false;
                    });
            } else {
                new AirMovements(flightDetails).$save()
                    .then(reloadFlights)
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'flight'))
                    .finally(() => {
                        $scope.busyLoadingFlight = false;
                    });
            }
        };

        $scope.delete = function (flight) {
            if (window.confirm('Do you really want to delete this flight?')) {
                AirMovements.deleteFlight({id: flight.FlightId}).$promise
                    .then(() => {
                        console.log('successfully removed flight.');
                        if ($scope.selectedFlight === flight) {
                            $scope.cancel();
                        }
                        $scope.flights = _.filter($scope.flights, function (f) {
                            return f !== flight;
                        });
                    })
                    .catch(_.partial(MessageManager.raiseError, 'delete', 'flight'));
            }
        };

        $scope.flightTypeChanged = () => {
            for (let i = 0; i < $scope.motorFlightTypes.length; i++) {
                let t = $scope.motorFlightTypes[i];
                if (hasDetails() && t.FlightTypeId === $scope.flightDetails.MotorFlightDetailsData.FlightTypeId) {
                    $scope.selectedFlightType = t;
                }
            }
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
            for (var i = 0; i < $scope.locations.length; i++) {
                let location = $scope.locations[i];
                if (location.LocationId === $scope.flightDetails.MotorFlightDetailsData.LdgLocationId) {
                    return location;
                }
            }
            return {};
        }

        function findSelectedStartLocation() {
            for (var i = 0; i < $scope.locations.length; i++) {
                let location = $scope.locations[i];
                if (location.LocationId === $scope.flightDetails.MotorFlightDetailsData.StartLocationId) {
                    return location;
                }
            }
            return {};
        }

        $scope.recalcRouteRequirements = () => {
            $scope.routeRequirements.isOutboundRouteRequired = findSelectedStartLocation().IsOutboundRouteRequired;
            $scope.routeRequirements.isInboundRouteRequired = findSelectedLandingLocation().IsInboundRouteRequired;
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

        $scope.engineSecondsCountersChanged = () => {
            $scope.times.engineSecondsCounterDuration = Math.max(
                0,
                $scope.flightDetails.MotorFlightDetailsData.EngineEndOperatingCounterInSeconds
                - $scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds
            );
        };

        $scope.copyLastCounterToStartOperatingCounter = () => {
            $scope.flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInSeconds = $scope.operatingCounters.EngineOperatingCounterInSeconds;
            $scope.engineSecondsCountersChanged();
        };

        $scope.editFlight = function (flight) {
            $location.path('/airmovements/' + flight.FlightId);
        };
    }

}
