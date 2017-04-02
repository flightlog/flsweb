import moment from "moment";

export default class PlanningDayEditController {
    constructor($scope, GLOBALS, $q, $routeParams, $location, PlanningDayReader,
                PlanningDaysUpdater, Locations, Persons,
                ReservationsByPlanningDay, ReservationService, NavigationCache,
                MessageManager, DropdownItemsRenderService, PlanningDaysDeleter) {

        $scope.debug = GLOBALS.DEBUG;
        NavigationCache.setCancellingLocationHere();
        $scope.renderPerson = DropdownItemsRenderService.personRenderer();
        $scope.renderLocation = DropdownItemsRenderService.locationRenderer();

        $scope.busy = true;

        function loadMasterData() {
            $scope.md = {};
            return $q.all([
                Persons.getGliderPilots().$promise
                    .then((result) => {
                        $scope.md.gliderPilots = result;
                    }),
                Persons.getTowingPilots().$promise
                    .then((result) => {
                        $scope.md.towingPilots = result;
                    }),
                Persons.getGliderInstructors().$promise
                    .then((result) => {
                        $scope.md.instructors = result;
                    }),
                Locations.getLocations().$promise
                    .then((result) => {
                        $scope.md.locations = result;
                    })
            ]);
        }

        function loadPlanningDay() {
            let deferred = $q.defer();
            if ($routeParams.id === 'new') {
                deferred.resolve({
                    CanUpdateRecord: true
                });
                return deferred.promise;
            }
            return PlanningDayReader.get({id: $routeParams.id}).$promise;
        }

        function mapPlanningDayEditMode(result) {
            $scope.editAllowed = result.CanUpdateRecord;
            $scope.planningDay = result;
            $scope.planningDay.CanUpdateRecord = $scope.planningDay.CanUpdateRecord && $routeParams.mode === 'edit';
        }

        function loadReservationsByPlanningDay() {
            if ($routeParams.id === 'new') {
                return [];
            }
            return ReservationsByPlanningDay.query({id: $routeParams.id}).$promise;
        }

        function mapReservations(result) {
            $scope.reservations = result;
            // TODO clarify if we can get the server to send the timezone so we dont have to hardcode this to UTC
            for (let i = 0; i < result.length; i++) {
                $scope.reservations[i].Start = moment.utc(result[i].Start).toDate();
                $scope.reservations[i].End = moment.utc(result[i].End).toDate();
            }
        }

        loadMasterData()
            .then(loadPlanningDay)
            .then(mapPlanningDayEditMode)
            .then(loadReservationsByPlanningDay)
            .then(mapReservations)
            .catch(_.partial(MessageManager.raiseError, 'load', 'planned day'))
            .finally(() => {
                $scope.busy = false;
            });

        $scope.cancel = function () {
            $location.path('/planning');
        };
        $scope.edit = function () {
            $location.path('/planning/' + $scope.planningDay.PlanningDayId + '/edit');
        };
        $scope.save = function (planningDay) {
            $scope.busy = true;
            // 'undo' the timezone offset from ui-datepicker again (so we end up on the original date again)
            let dt = new Date(planningDay.Day);
            dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
            planningDay.Day = dt;
            let d = new PlanningDaysUpdater(planningDay);
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

        $scope.delete = (planningDay) => {
            if (window.confirm('Do you really want to delete this planningday?')) {
                PlanningDaysDeleter.deleteDay({id: planningDay.PlanningDayId}).$promise
                    .then(() => {
                        $scope.cancel();
                    })
                    .catch(_.partial(MessageManager.raiseError, 'delete', 'planned day'));
            }
        };

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
