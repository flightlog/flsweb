import moment from "moment";

export default class PlanningDayEditController {
    constructor($scope, GLOBALS, $q, $routeParams, $location, PlanningDayReader,
                PlanningDaysUpdater, Locations, Persons,
                ReservationsByPlanningDay, ReservationService, NavigationCache,
                MessageManager, DropdownItemsRenderService) {

        $scope.debug = GLOBALS.DEBUG;
        NavigationCache.setCancellingLocationHere();

        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();

        $scope.busy = true;
        function loadPlanningDay() {
            var deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return PlanningDayReader.get({id: $routeParams.id}).$promise;
        }

        var loadingDayPromise = loadPlanningDay()
            .then(function (result) {
                $scope.editAllowed = result.CanUpdateRecord;
                $scope.planningDay = result;
                $scope.planningDay.CanUpdateRecord = $scope.planningDay.CanUpdateRecord && $routeParams.mode === 'edit';
            })
            .then(function () {
                return Locations.getLocations();
            })
            .then(function (result) {
                $scope.locations = result;
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'planned day'));

        $scope.cancel = function () {
            $location.path('/planning');
        };
        $scope.edit = function () {
            $location.path('/planning/' + $scope.planningDay.PlanningDayId + '/edit');
        };
        $scope.save = function (planningDay) {
            $scope.busy = true;
            // 'undo' the timezone offset from ui-datepicker again (so we end up on the original date again)
            var dt = new Date(planningDay.Day);
            dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
            planningDay.Day = dt;
            var d = new PlanningDaysUpdater(planningDay);
            if (planningDay.PlanningDayId) {
                d.$saveDay({id: planningDay.PlanningDayId})
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'save', 'planned day'));
            } else {
                d.$save()
                    .then($scope.cancel)
                    .catch(_.partial(MessageManager.raiseError, 'insert', 'planned day'));
            }
        };

        var promises = [];
        promises.push(Persons.getTowingPilots().$promise
            .then(function (result) {
                $scope.towingPilots = result;
            }));
        promises.push(Persons.getGliderPilots().$promise
            .then(function (result) {
                $scope.gliderPilots = result;
            }));
        promises.push(Persons.getGliderInstructors().$promise
            .then(function (result) {
                $scope.instructors = result;
            }));
        promises.push(loadingDayPromise);

        $q.all(promises)
            .then(() => {
                if ($routeParams.id === 'new') {
                    return [];
                }
                return ReservationsByPlanningDay.query({id: $routeParams.id}).$promise;
            })
            .then((result) => {
                $scope.reservations = result;
                // TODO clarify if we can get the server to send the timezone so we dont have to hardcode this to UTC
                for (var i = 0; i < result.length; i++) {
                    $scope.reservations[i].Start = moment.utc(result[i].Start).toDate();
                    $scope.reservations[i].End = moment.utc(result[i].End).toDate();
                }
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'planned day data'))
            .finally(() => {
                $scope.busy = false;
            });

        function openReservationEditor(reservation, mode) {
            $location.path('/reservations/' + reservation.AircraftReservationId + '/' + mode);
        }

        $scope.showReservationDetails = function (reservation) {
            openReservationEditor(reservation, 'view');
        };
        $scope.editReservation = function (reservation) {
            openReservationEditor(reservation, 'edit');
        };
        $scope.deleteReservation = function (reservation) {
            ReservationService.delete(reservation, $scope);
        };
        $scope.newReservation = function () {
            $location.search('date', $scope.planningDay.Day);
            $location.search('locationId', $scope.planningDay.LocationId);
            $location.path('/reservations/new/edit');
        };
    }
}
