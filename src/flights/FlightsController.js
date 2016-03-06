import moment from 'moment';
import * as _ from 'lodash';
import AddPersonController from '../masterdata/persons/modal/AddPersonController';

export default class FlightsController {
    constructor($scope, $q, $log, $modal, $timeout, MessageManager,
                TimeService, Flights, FlightsDateRange,
                FlightTypes, Locations, Persons, PersonPersister, PassengerPersister,
                Aircrafts, StartTypes, GLOBALS, FlightCostBalanceTypes,
                SoloFlightCheckboxEnablementCalculator, Clubs) {
        $scope.busy = true;
        $scope.debug = GLOBALS.DEBUG;
        $scope.showChart = false;
        var format = 'HH:mm';
        var masterDataLoaded = false;

        $scope.starttypes = [];
        $scope.locations = [];
        $scope.gliderFlightTypes = [];
        $scope.towingFlightTypes = [];
        $scope.gliderAircrafts = [];
        $scope.towerAircrafts = [];
        $scope.gliderPilots = [];
        $scope.towingPilots = [];
        $scope.observers = [];
        $scope.winchOperators = [];
        $scope.passengers = [];
        $scope.instructors = [];
        $scope.flightCostBalanceTypes = [];

        function renderWithId(idName, labelName) {
            return (data, escape) => {
                return '<div class="option">' + escape(data[idName]) + ' - ' + escape(data[labelName]) + '</div>';
            }
        }

        function renderPerson(person, escape) {
            return '<div class="option">' + escape(person.Firstname) + ' ' + escape(person.Lastname) + (person.City ? ' (' + escape(person.City) + ')' : '') + '</div>';
        }

        function renderAircraft(aircraft, escape) {
            return '<div class="option">' + escape(aircraft.Immatriculation) +
                (aircraft.CompetitionSign ? ' [' + escape(aircraft.CompetitionSign) + ']' : '') +
                (aircraft.AircraftModel ? ' (' + escape(aircraft.AircraftModel) + ')' : '') + '</div>';
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

        var today = moment();
        var dateStringFormat = 'DD.MM.YYYY';

        function formatDate(d) {
            return d.format(dateStringFormat);
        }

        var todayFormatted = formatDate(today);
        $scope.fromDate = todayFormatted;
        $scope.toDate = todayFormatted;

        $scope.loadAllTime = function () {
            $scope.fromDate = '';
            $scope.toDate = todayFormatted;
            reloadFlights();
        };
        $scope.loadMonths = function (num) {
            $scope.fromDate = formatDate(moment().subtract(num, 'months'));
            $scope.toDate = todayFormatted;
            reloadFlights();
        };
        $scope.loadMonth = function (num) {
            $scope.fromDate = formatDate(moment().startOf('month').subtract(num, 'months'));
            $scope.toDate = formatDate(moment().startOf('month').subtract(num - 1, 'months'));
            reloadFlights();
        };
        $scope.loadToday = function () {
            $scope.fromDate = todayFormatted;
            $scope.toDate = todayFormatted;
            reloadFlights();
        };
        $scope.loadYesterday = function () {
            $scope.fromDate = formatDate(moment().subtract(1, 'days'));
            $scope.toDate = $scope.fromDate;
            reloadFlights();
        };

        $scope.reloadList = function () {
            reloadFlights();
        };

        function toQueryDate(d) {
            var queryDateFormat = 'YYYY-MM-DD';
            var m = moment(d, dateStringFormat);
            if (m.isValid()) {
                return m.format(queryDateFormat);
            } else {
                return '0001-01-01';
            }
        }

        function reloadFlights() {
            $scope.busy = true;
            var fromDate = toQueryDate($scope.fromDate);
            var toDate = toQueryDate($scope.toDate);
            FlightsDateRange.getFlights({from: fromDate, to: toDate}).$promise
                .then((result) => {
                    $scope.flights = result;
                    for (var i = 0; i < result.length; i++) {
                        $scope.flights[i]._formattedDate = result[i].StartDateTime && moment(result[i].StartDateTime).format('DD.MM.YYYY HH:mm dddd');
                    }
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'flights'))
                .finally(function () {
                    $scope.busy = false;
                });
        }

        reloadFlights();

        function hasDetails() {
            return $scope.flightDetails && $scope.flightDetails.GliderFlightDetailsData !== undefined;
        }

        $scope.gliderAircraftSelectionChanged = () => {
            $timeout(() => {
                if (hasDetails()) {
                    recalcCheckboxState();
                    $scope.gliderCompetitionSign = '?';
                    if ($scope.flightDetails && $scope.gliderAircrafts) {
                        for (var i = 0; i < $scope.gliderAircrafts.length; i++) {
                            var glider = $scope.gliderAircrafts[i];
                            if (glider.AircraftId === $scope.flightDetails.GliderFlightDetailsData.AircraftId) {
                                $scope.flightDetails.GliderFlightDetailsData.IsSoloFlight = glider.NrOfSeats === 1;
                                $scope.gliderCompetitionSign = glider.CompetitionSign;
                            }
                        }
                    }
                }
            }, 0);
        };

        $scope.towingAircraftSelectionChanged = function () {
            if ($scope.flightDetails.TowFlightDetailsData && !$scope.flightDetails.TowFlightDetailsData.PilotPersonId) {
                $scope.flightDetails.TowFlightDetailsData.PilotPersonId = "";
            }
            $timeout(() => {
                if (hasDetails()) {
                    $scope.towplaneRegistration = '?';
                    if ($scope.flightDetails && $scope.towerAircrafts) {
                        for (var i = 0; i < $scope.towerAircrafts.length; i++) {
                            var tow = $scope.towerAircrafts[i];
                            if (tow.AircraftId === ($scope.flightDetails.TowFlightDetailsData && $scope.flightDetails.TowFlightDetailsData.AircraftId)) {
                                $scope.flightDetails.TowFlightDetailsData.AircraftId = tow.AircraftId;
                                $scope.towplaneRegistration = tow.Immatriculation.substring(tow.Immatriculation.indexOf('-') + 2);
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
            Clubs.getMyClub().$promise.then((result) => {
                $scope.myClub = result;
                flightDetails.GliderFlightDetailsData.StartLocationId = $scope.myClub.HomebaseId || flightDetails.GliderFlightDetailsData.StartLocationId;
                flightDetails.GliderFlightDetailsData.LdgLocationId = $scope.myClub.HomebaseId || flightDetails.GliderFlightDetailsData.LdgLocationId;
                flightDetails.GliderFlightDetailsData.FlightTypeId = $scope.myClub.DefaultGliderFlightTypeId || flightDetails.GliderFlightDetailsData.FlightTypeId;
                flightDetails.GliderFlightDetailsData.NrOfLdgs = 1;
                flightDetails.TowFlightDetailsData.StartLocationId = $scope.myClub.HomebaseId || flightDetails.TowFlightDetailsData.StartLocationId;
                flightDetails.TowFlightDetailsData.LdgLocationId = $scope.myClub.HomebaseId || flightDetails.TowFlightDetailsData.LdgLocationId;
                flightDetails.TowFlightDetailsData.FlightTypeId = $scope.myClub.DefaultTowFlightTypeId || flightDetails.TowFlightDetailsData.FlightTypeId;
                flightDetails.TowFlightDetailsData.NrOfLdgs = 1;
                flightDetails.StartType = flightDetails.StartType || $scope.myClub.DefaultStartType || "1";
                deferred.resolve(flightDetails);
            }).catch((reason) => {
                deferred.reject(reason);
            });
            return deferred.promise;
        }

        function loadFlight(flight, toBeCopied) {
            if (flight.FlightId) {
                return Flights.getFlight({id: flight.FlightId}).$promise;
            }
            if (toBeCopied) {
                return Flights.getFlight({id: toBeCopied.FlightId}).$promise
                    .then((res) => {
                        let flightDetails = {};
                        flightDetails.GliderFlightDetailsData = res.GliderFlightDetailsData || {};
                        flightDetails.StartType = res.StartType;
                        flightDetails.FlightId = undefined;
                        flightDetails.TowFlightDetailsData = res.TowFlightDetailsData || {};
                        flightDetails.GliderFlightDetailsData.FlightId = undefined;
                        flightDetails.GliderFlightDetailsData.StartDateTime = undefined;
                        flightDetails.GliderFlightDetailsData.LdgDateTime = undefined;
                        flightDetails.GliderFlightDetailsData.FlightComment = undefined;
                        flightDetails.TowFlightDetailsData.FlightId = undefined;
                        flightDetails.TowFlightDetailsData.StartDateTime = undefined;
                        flightDetails.TowFlightDetailsData.LdgDateTime = undefined;
                        flightDetails.TowFlightDetailsData.FlightComment = undefined;
                        return initForNewFlight(flightDetails);
                    });
            } else {
                return $q.when(initForNewFlight({
                    GliderFlightDetailsData: {},
                    TowFlightDetailsData: {}
                }));
            }
        }

        $scope.getTimeNow = function () {
            if (!$scope.times.flightDate) {
                $scope.times.flightDate = new Date();
            }
            return TimeService.time(new Date());
        };

        $scope.getDateToday = function () {
            return new Date();
        };

        var loadMasterdataDeferred = $q.defer();
        var loadInitialMasterdataPromise = loadMasterdataDeferred.promise;

        function loadMasterdata() {
            if (!masterDataLoaded) {
                var promises = [];
                promises.push(Persons.getAllPersons().$promise.then((result) => {
                    angular.copy(result, $scope.allPersons);
                }));
                promises.push(Persons.getGliderPilots().$promise.then((result) => {
                    angular.copy(result, $scope.gliderPilots);
                }));
                promises.push(Persons.getTowingPilots().$promise.then((result) => {
                    angular.copy(result, $scope.towingPilots);
                }));
                promises.push(Persons.getGliderInstructors().$promise.then((result) => {
                    angular.copy(result, $scope.instructors);
                }));
                promises.push(Persons.getGliderObservers().$promise.then((result) => {
                    angular.copy(result, $scope.observers);
                }));
                promises.push(Persons.getWinchOperators().$promise.then((result) => {
                    angular.copy(result, $scope.winchOperators);
                }));
                promises.push(Persons.getPassengers().$promise.then((result) => {
                    angular.copy(result, $scope.passengers);
                }));
                promises.push(Locations.getLocations().$promise.then((result) => {
                    angular.copy(result, $scope.locations);
                }));
                promises.push(Aircrafts.getGliders().$promise.then((result) => {
                    angular.copy(result, $scope.gliderAircrafts);
                }));
                promises.push(Aircrafts.getTowingPlanes().$promise.then((result) => {
                    angular.copy(result, $scope.towerAircrafts);
                }));
                promises.push(StartTypes.query().$promise.then((result) => {
                    angular.copy(result, $scope.starttypes);
                }));
                promises.push(FlightTypes.queryFlightTypesFor({dest: 'gliders'}).$promise.then((result) => {
                    angular.copy(result, $scope.gliderFlightTypes);
                }));
                promises.push(FlightTypes.queryFlightTypesFor({dest: 'towing'}).$promise.then((result) => {
                    angular.copy(result, $scope.towingFlightTypes);
                }));
                promises.push(FlightCostBalanceTypes.query().$promise.then((result) => {
                    angular.copy(result, $scope.flightCostBalanceTypes);
                }));
                promises.push(Clubs.getMyClub().$promise.then((result) => {
                    angular.copy(result, $scope.myClub);
                }));
                return $q.all(promises)
                    .then(() => {
                        masterDataLoaded = true;
                    });
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

        $scope.reloadMasterdata = function () {
            $scope.loadingMasterdata = true;
            masterDataLoaded = false;
            loadMasterdata()
                .catch(_.partial(MessageManager.raiseError, 'load', 'masterdata'))
                .finally(function () {
                    $scope.loadingMasterdata = false;
                });
        };

        function selectFlight(flight, toBeCopied) {
            $scope.PersonForInvoiceRequired = false;
            var loadFlightPromise = loadFlight(flight, toBeCopied).then((result) => {
                $scope.flightDetails = result;
                if (result.TowFlightDetailsData && result.TowFlightDetailsData.AircraftId === '00000000-0000-0000-0000-000000000000') {
                    result.TowFlightDetailsData.AircraftId = "";
                }
                if (result.TowFlightDetailsData && result.TowFlightDetailsData.PilotPersonId === '00000000-0000-0000-0000-000000000000') {
                    result.TowFlightDetailsData.PilotPersonId = "";
                }

                var gld = $scope.flightDetails.GliderFlightDetailsData;
                var tow = $scope.flightDetails.TowFlightDetailsData;
                $scope.times = {
                    flightDate: gld && gld.StartDateTime || gld.FlightDate || new Date(),
                    gliderStart: TimeService.time(gld && gld.StartDateTime),
                    gliderLanding: TimeService.time(gld && gld.LdgDateTime),
                    towingStart: TimeService.time(gld && gld.StartDateTime),
                    towingLanding: TimeService.time(tow && tow.LdgDateTime)
                };
                $scope.times.gliderDuration = calcDuration($scope.times.gliderStart, $scope.times.gliderLanding);
                $scope.times.towingDuration = calcDuration($scope.times.gliderStart, $scope.times.towingLanding);

                Aircrafts.getGliders().$promise.then((result) => {
                    $scope.gliderAircrafts = result;
                    $scope.gliderAircraftSelectionChanged();
                });

                Aircrafts.getTowingPlanes().$promise.then((result) => {
                    $scope.towingAircrafts = result;
                    $scope.towingAircraftSelectionChanged();
                });
            });

            return $q.all([loadFlightPromise, loadInitialMasterdataPromise])
                .then(function () {
                    $scope.flightTypeChanged();
                    $scope.flightCostBalanceTypeChanged();
                    $scope.startTypeChanged();
                    recalcRouteRequirements();
                })
                .catch(_.partial(MessageManager.raiseError, 'load', 'masterdata'))
                .finally(function () {
                    $scope.busyLoadingFlight = false;
                });
        }

        function formatTime(time) {
            if (time === undefined) {
                return;
            }
            if (time.length === 3) {
                time = '0' + time;
            }
            if (time.length > 2 && time.indexOf(':') === -1) {
                return time.substring(0, 2) + ':' + time.substring(2);
            } else if (time.length <= 1) {
                return '00:0' + time
            } else if (time.length <= 2) {
                return '00:' + time
            }
            return time;
        }

        $scope.select = function (flight, toBeCopied) {
            $scope.gliderCompetitionSign = '?';
            $scope.towplaneRegistration = '?';
            $scope.busyLoadingFlight = true;
            $scope.selectedFlight = flight;

            // make sure the busy sign shows also on slow devices
            $timeout(function () {
                selectFlight(flight, toBeCopied);
            }, 300);
        };
        $scope.cancel = function () {
            $scope.selectedFlight = undefined;
            $scope.flightDetails = undefined;
        };

        $scope.new = function (toBeCopied) {
            $scope.newFlight = {};
            $scope.select($scope.newFlight, toBeCopied);
        };

        $scope.save = function (flightDetails) {
            MessageManager.reset();
            $scope.busyLoadingFlight = true;

            var flightDate = moment($scope.times.flightDate).format("DD.MM.YYYY");
            flightDetails.GliderFlightDetailsData.StartDateTime = TimeService.parseDateTime(flightDate, $scope.times.gliderStart);
            flightDetails.GliderFlightDetailsData.FlightDate = flightDetails.GliderFlightDetailsData.StartDateTime;
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
                    .then(reloadFlights)
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'flight'))
                    .finally(function () {
                        $scope.busyLoadingFlight = false;
                    });
            } else {
                new Flights(flightDetails).$save()
                    .then(reloadFlights)
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'flight'))
                    .finally(function () {
                        $scope.busyLoadingFlight = false;
                    });
            }
        };

        $scope.delete = function (flight) {
            if (window.confirm('Do you really want to delete this flight?')) {
                Flights.deleteFlight({id: flight.FlightId}).$promise
                    .then(function () {
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

        $scope.flightTypeChanged = function () {
            $timeout(() => {
                for (var i = 0; i < $scope.gliderFlightTypes.length; i++) {
                    var t = $scope.gliderFlightTypes[i];
                    if (hasDetails() && t.FlightTypeId === $scope.flightDetails.GliderFlightDetailsData.FlightTypeId) {
                        $scope.selectedFlightType = t;
                        recalcCheckboxState();
                    }
                }
            });
        };

        function createModalConfig(flags) {
            var flagsOrDefaults = flags || {
                    GliderPilot: true,
                    TowingPilot: false,
                    Passenger: false
                };
            return {
                template: require('../masterdata/persons/modal/add-person.html'),
                controller: AddPersonController,
                resolve: {
                    flags: function () {
                        return flagsOrDefaults;
                    }
                }
            };
        }

        $scope.newGliderPilot = function () {
            var modalInstance = $modal.open(createModalConfig({
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

        $scope.newTowingPilot = function () {
            var modalInstance = $modal.open(createModalConfig({
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

        $scope.newPassenger = function () {
            var modalInstance = $modal.open(createModalConfig({
                GliderPilot: false,
                Passenger: true
            }));

            modalInstance.result.then(function (passenger) {
                $log.info(JSON.stringify(passenger));
                new PassengerPersister(passenger).$save()
                    .then(function (savedPassenger) {
                        console.log('successfully saved ' + JSON.stringify(savedPassenger));
                        $scope.passengers.push(savedPassenger);
                        $scope.flightDetails.GliderFlightDetailsData.PassengerPersonId = savedPassenger.PersonId;
                    })
                    .catch(_.partial(MessageManager.raiseError, 'save', 'passenger'));
            });
        };

        $scope.flightCostBalanceTypeChanged = function () {
            $timeout(() => {
                for (var i = 0; i < $scope.flightCostBalanceTypes.length; i++) {
                    if (hasDetails() && $scope.flightCostBalanceTypes[i].FlightCostBalanceTypeId == $scope.flightDetails.GliderFlightDetailsData.FlightCostBalanceType) {
                        $scope.PersonForInvoiceRequired = $scope.flightCostBalanceTypes[i].PersonForInvoiceRequired;
                    }
                }
            });
        };

        $scope.toggleSoloFlight = function () {
            if ($scope.selectedFlightType && $scope.flightDetails.CanUpdateRecord &&
                hasDetails() && !$scope.selectedFlightType.IsSoloFlight && !$scope.selectedFlightType.IsPassengerFlight) {
                $scope.flightDetails.GliderFlightDetailsData.IsSoloFlight = !$scope.flightDetails.GliderFlightDetailsData.IsSoloFlight;
                recalcCheckboxState();
            }
        };

        function calcDurationWarning() {
            var gliderDuration = moment($scope.times.gliderDuration, format);
            var towDuration = moment($scope.times.towingDuration, format);
            if (gliderDuration.isValid() && towDuration.isValid()) {
                $scope.warnTowFlightLongerThanGliderFlight = gliderDuration.isBefore(towDuration);
            }
            else {
                $scope.warnTowFlightLongerThanGliderFlight = false;
            }
        }

        function calcDuration(from, to) {
            var toMoment = moment(to, format);
            var fromMoment = moment(from, format);
            if (toMoment.isValid() && fromMoment.isValid()) {
                return toMoment.subtract(fromMoment).format(format);
            }
        }

        function calcLanding(start, duration) {
            var startMoment = moment(start, format);
            var durationMoment = moment(duration, format);
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

        $scope.startLocationChanged = function () {
            $scope.flightDetails.GliderFlightDetailsData.LdgLocationId = $scope.flightDetails.GliderFlightDetailsData.StartLocationId;
            if ($scope.flightDetails.TowFlightDetailsData) {
                $scope.flightDetails.TowFlightDetailsData.LdgLocationId = $scope.flightDetails.GliderFlightDetailsData.StartLocationId;
            }
            recalcRouteRequirements();
        };

        $scope.gliderLandingLocationChanged = function () {
            recalcRouteRequirements();
        };

        $scope.towLandingLocationChanged = function () {
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

        $scope.formatGliderStart = function () {
            var times = $scope.times;
            times.gliderStart = formatTime(times.gliderStart);
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
        };

        $scope.setGliderStart = function () {
            var times = $scope.times;
            times.gliderStart = $scope.getTimeNow();
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
        };

        $scope.formatGliderLanding = function () {
            var times = $scope.times;
            times.gliderLanding = formatTime(times.gliderLanding);
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
            calcDurationWarning();
        };

        $scope.setGliderLanding = function () {
            var times = $scope.times;
            times.gliderLanding = $scope.getTimeNow();
            times.gliderDuration = calcDuration(times.gliderStart, times.gliderLanding);
            calcDurationWarning();
        };

        $scope.formatGliderDuration = function () {
            var times = $scope.times;
            times.gliderDuration = formatTime(times.gliderDuration);
            times.gliderLanding = calcLanding(times.gliderStart, times.gliderDuration);
            calcDurationWarning();
        };

        $scope.formatTowLanding = function () {
            var times = $scope.times;
            times.towingLanding = formatTime(times.towingLanding);
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
            calcDurationWarning();
        };

        $scope.setTowLanding = function () {
            var times = $scope.times;
            times.towingLanding = $scope.getTimeNow();
            times.towingDuration = calcDuration(times.gliderStart, times.towingLanding);
            calcDurationWarning();
        };

        $scope.formatTowDuration = function () {
            var times = $scope.times;
            times.towingDuration = formatTime(times.towingDuration);
            times.towingLanding = calcLanding(times.gliderStart, times.towingDuration);
            calcDurationWarning();
        };
    }
}
