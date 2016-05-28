import moment from 'moment';
import * as _ from 'lodash';
import AddPersonController from '../../masterdata/persons/modal/AddPersonController';
import TimeService from '../../core/TimeService';

export default class AirMovementsController {

    constructor($scope, $q, $timeout, TimeService, $log, $modal, MessageManager,
                AirMovements, AirMovementsDateRange,
                Locations, Persons, PersonPersister, PassengerPersister, Aircrafts, FlightTypes,
                SpecificStartTypes, GLOBALS, Clubs, AircraftOperatingCounters) {
        this.format = 'HH:mm';
        this.TimeService = TimeService;
        var masterDataLoaded = false;
        $scope.busy = true;
        $scope.debug = GLOBALS && GLOBALS.DEBUG;
        $scope.showChart = false;

        $scope.starttypes = [];
        $scope.locations = [];
        $scope.motorFlightTypes = [];
        $scope.motorAircrafts = [];
        $scope.motorPilots = [];
        $scope.observers = [];
        $scope.instructors = [];
        $scope.filterDates = {};

        function renderWithId(idName, labelName) {
            return (data, escape) => {
                return '<div class="option">' + escape(data[idName]) + ' - ' + escape(data[labelName]) + '</div>';
            }
        }

        function renderPerson(person, escape) {
            return '<div class="option">' + escape(person.Firstname) + ' ' + escape(person.Lastname) + (person.City ? ' (' + escape(person.City) + ')' : '') + '</div>';
        }

        function seatLabel(NrOfSeats) {
            return ' Seat' + ((NrOfSeats > 1) ? 's' : '');
        }

        function renderAircraft(aircraft, escape) {
            return '<div class="option">' + escape(aircraft.Immatriculation) +
                (aircraft.CompetitionSign ? ' [' + escape(aircraft.CompetitionSign) + ']' : '') +
                (aircraft.AircraftModel ? ' (' + escape(aircraft.AircraftModel) + ')' : '') +
                (aircraft.NrOfSeats ? ' - ' + escape(aircraft.NrOfSeats) + seatLabel(aircraft.NrOfSeats) : '') + ' </div>';
        }

        $scope.renderStarttype = {
            option: renderWithId('StartTypeId', 'StartTypeName'),
            item: renderWithId('StartTypeId', 'StartTypeName')
        };

        $scope.renderFlighttype = {
            option: renderWithId('FlightCode', 'FlightTypeName'),
            item: renderWithId('FlightCode', 'FlightTypeName')
        };

        $scope.renderPerson = {
            option: renderPerson,
            item: renderPerson
        };

        $scope.renderAircraft = {
            option: renderAircraft,
            item: renderAircraft
        };

        let today = moment();
        let dateStringFormat = 'DD.MM.YYYY';

        $scope.filterDates.fromDate = today;
        $scope.filterDates.toDate = today;

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

        function toQueryDate(d) {
            let queryDateFormat = 'YYYY-MM-DD';
            let m = moment(d);
            if (d && m.isValid()) {
                return m.format(queryDateFormat);
            } else {
                return '0001-01-01';
            }
        }

        function reloadFlights() {
            $scope.busy = true;
            let fromDate = toQueryDate($scope.filterDates.fromDate);
            let toDate = toQueryDate($scope.filterDates.toDate);
            AirMovementsDateRange.getFlights({from: fromDate, to: toDate}).$promise
                .then((result) => {
                    $scope.flights = result;
                    for (let i = 0; i < result.length; i++) {
                        $scope.flights[i]._formattedDate = result[i].StartDateTime && moment(result[i].StartDateTime).format('DD.MM.YYYY HH:mm dddd');
                    }
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'flights'))
                .finally(() => {
                    $scope.busy = false;
                });
        }

        function hasDetails() {
            return $scope.flightDetails && $scope.flightDetails.MotorFlightDetailsData !== undefined;
        }

        let formatMinutesToLongHoursFormat = TimeService.formatMinutesToLongHoursFormat.bind(this);

        $scope.motorAircraftSelectionChanged = () => {
            $timeout(() => {
                if (hasDetails()) {

                    $scope.motorRegistration = '';
                    if ($scope.flightDetails && $scope.motorAircrafts) {
                        for (let i = 0; i < $scope.motorAircrafts.length; i++) {
                            let motorAircraft = $scope.motorAircrafts[i];
                            if (motorAircraft.AircraftId === ($scope.flightDetails.MotorFlightDetailsData && $scope.flightDetails.MotorFlightDetailsData.AircraftId)) {
                                $scope.flightDetails.MotorFlightDetailsData.AircraftId = motorAircraft.AircraftId;
                                $scope.motorRegistration = motorAircraft.Immatriculation.substring(motorAircraft.Immatriculation.indexOf('-') + 2);

                                AircraftOperatingCounters.query({AircraftId: motorAircraft.AircraftId}).$promise.then((result) => {
                                    $scope.operatingCounters = result;
                                    $scope.times.lastOperatingCounterFormatted = formatMinutesToLongHoursFormat(result.EngineOperatingCounterInMinutes);
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

        var loadMasterdataDeferred = $q.defer();
        var loadInitialMasterdataPromise = loadMasterdataDeferred.promise;

        function loadMasterdata() {
            if (!masterDataLoaded) {
                let promises = [];
                promises.push(Persons.getAllPersons().$promise.then((result) => {
                    angular.copy(result, $scope.allPersons);
                }));
                promises.push(Persons.getMotorPilots().$promise.then((result) => {
                    angular.copy(result, $scope.motorPilots);
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
                promises.push(FlightTypes.queryFlightTypesFor({dest: 'motor'}).$promise.then((result) => {
                    angular.copy(result, $scope.motorFlightTypes);
                }));
                promises.push(Clubs.getMyClub().$promise.then((result) => {
                    $scope.myClub = result;
                }));
                return $q.all(promises);
            } else {
                return $q.when();
            }
        }

        $timeout(() => {
            loadMasterdata()
                .then((result) => {
                    loadMasterdataDeferred.resolve(result);
                })
                .catch((reason) => {
                    loadMasterdataDeferred.reject(reason);
                });
        }, 2000);

        $scope.reloadMasterdata = () => {
            $scope.loadingMasterdata = true;
            masterDataLoaded = false;
            loadMasterdata()
                .catch(_.partial(MessageManager.raiseError, 'load', 'masterdata'))
                .finally(() => {
                    $scope.loadingMasterdata = false;
                });
        };

        function selectFlight(flight, toBeCopied) {
            $scope.operatingCounters = undefined;
            $scope.PersonForInvoiceRequired = false;
            let loadFlightPromise = loadFlight(flight, toBeCopied).then((result) => {
                $scope.flightDetails = result;

                let motorFlight = $scope.flightDetails.MotorFlightDetailsData;
                $scope.times = {
                    flightDate: (motorFlight.StartDateTime || motorFlight.FlightDate) || new Date(),
                    motorStart: TimeService.time(motorFlight.StartDateTime),
                    motorLanding: TimeService.time(motorFlight.LdgDateTime),
                    blockTimeStart: TimeService.time(motorFlight.BlockStartDateTime),
                    blockTimeEnd: TimeService.time(motorFlight.BlockEndDateTime),
                    engineMinutesCounterBegin: TimeService.formatMinutesToLongHoursFormat(motorFlight.EngineStartOperatingCounterInMinutes),
                    engineMinutesCounterEnd: TimeService.formatMinutesToLongHoursFormat(motorFlight.EngineEndOperatingCounterInMinutes)
                };
                $scope.times.motorDuration = this.calcDuration($scope.times.motorStart, $scope.times.motorLanding);
                $scope.times.blockDuration = this.calcDuration($scope.times.blockTimeStart, $scope.times.blockTimeEnd);
                $scope.engineMinutesCountersChanged();

                Aircrafts.getTowingPlanes().$promise.then((result) => {
                    $scope.motorAircrafts = result;
                    $scope.motorAircraftSelectionChanged();
                });
            });

            return $q.all([loadFlightPromise, loadInitialMasterdataPromise])
                .then(() => {
                    $scope.flightTypeChanged();
                    $scope.recalcRouteRequirements();
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'masterdata'))
                .finally(() => {
                    $scope.busyLoadingFlight = false;
                });
        }

        $scope.select = (flight, toBeCopied) => {
            $scope.motorAircraftRegistration = '';
            $scope.busyLoadingFlight = true;
            $scope.selectedFlight = flight;

            // make sure the busy sign shows also on slow devices
            $timeout(() => {
                selectFlight.bind(this)(flight, toBeCopied);
            }, 300);
        };
        $scope.cancel = () => {
            $scope.selectedFlight = undefined;
            $scope.flightDetails = undefined;
        };

        $scope.new = function (toBeCopied) {
            $scope.newFlight = {};
            $scope.select($scope.newFlight, toBeCopied);
        };

        $scope.save = (flightDetails) => {
            MessageManager.reset();
            $scope.busyLoadingFlight = true;
            var flightDate = moment($scope.times.flightDate).format("DD.MM.YYYY");
            flightDetails.MotorFlightDetailsData.StartDateTime = TimeService.parseDateTime(flightDate, $scope.times.motorStart);
            flightDetails.MotorFlightDetailsData.LdgDateTime = TimeService.parseDateTime(flightDate, $scope.times.motorLanding);
            flightDetails.MotorFlightDetailsData.BlockStartDateTime = TimeService.parseDateTime(flightDate, $scope.times.blockTimeStart);
            flightDetails.MotorFlightDetailsData.BlockEndDateTime = TimeService.parseDateTime(flightDate, $scope.times.blockTimeEnd);
            flightDetails.MotorFlightDetailsData.EngineStartOperatingCounterInMinutes = TimeService.longDurationFormatToMinutes($scope.times.engineMinutesCounterBegin);
            flightDetails.MotorFlightDetailsData.EngineEndOperatingCounterInMinutes = TimeService.longDurationFormatToMinutes($scope.times.engineMinutesCounterEnd);

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
            $timeout(() => {
                $scope.isOutboundRouteRequired = findSelectedStartLocation().IsOutboundRouteRequired;
                $scope.isInboundRouteRequired = findSelectedLandingLocation().IsInboundRouteRequired;
            }, 0);
        };

        $scope.formatMotorStart = () => {
            let times = $scope.times;
            times.motorStart = this.TimeService.formatTime(times.motorStart);
            times.motorDuration = this.calcDuration(times.motorStart, times.motorLanding);
        };

        $scope.formatMotorLanding = () => {
            let times = $scope.times;
            times.motorLanding = this.TimeService.formatTime(times.motorLanding);
            times.motorDuration = this.calcDuration(times.motorStart, times.motorLanding);
        };

        $scope.setMotorStart = () => {
            let times = $scope.times;
            times.motorStart = $scope.getTimeNow();
            times.motorDuration = this.calcDuration(times.motorStart, times.motorLanding);
        };

        $scope.setMotorLanding = () => {
            let times = $scope.times;
            times.motorLanding = $scope.getTimeNow();
            times.motorDuration = this.calcDuration(times.motorStart, times.motorLanding);
        };

        $scope.setBlockTimeStart = () => {
            let times = $scope.times;
            times.blockTimeStart = $scope.getTimeNow();
            times.blockDuration = this.calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.setBlockTimeEnd = () => {
            let times = $scope.times;
            times.blockTimeEnd = $scope.getTimeNow();
            times.blockDuration = this.calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.formatBlockTimeStart = () => {
            let times = $scope.times;
            times.blockTimeStart = this.TimeService.formatTime(times.blockTimeStart);
            times.blockDuration = this.calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.formatBlockTimeEnd = () => {
            let times = $scope.times;
            times.blockTimeEnd = this.TimeService.formatTime(times.blockTimeEnd);
            times.blockDuration = this.calcDuration(times.blockTimeStart, times.blockTimeEnd);
        };

        $scope.engineMinutesCountersChanged = () => {
            this.engineMinutesCountersChanged($scope.times);
        };
    }

    calcDuration(from, to) {
        let toMoment = moment(to, this.format);
        let fromMoment = moment(from, this.format);
        if (toMoment.isValid() && fromMoment.isValid()) {
            return toMoment.subtract(fromMoment).format(this.format);
        }
    }

    engineMinutesCountersChanged(times) {
        times.engineMinutesCounterBegin = this.TimeService.formatTime(times.engineMinutesCounterBegin);
        times.engineMinutesCounterEnd = this.TimeService.formatTime(times.engineMinutesCounterEnd);
        if (times.engineMinutesCounterBegin && times.engineMinutesCounterEnd) {
            times.engineDuration = this.TimeService.calcLongDuration(times.engineMinutesCounterBegin, times.engineMinutesCounterEnd);
        }
    }

}
