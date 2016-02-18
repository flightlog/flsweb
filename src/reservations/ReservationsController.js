import moment from 'moment';

export default class ReservationsController {
    constructor($scope, $location, Reservations, ReservationService, NavigationCache, MessageManager) {
        NavigationCache.setCancellingLocationHere();
        $scope.busy = true;
        Reservations.query().$promise
            .then(function (result) {
                $scope.reservations = result;
                for (var i = 0; i < result.length; i++) {
                    $scope.reservations[i]._formattedDate = result[i].Start && moment(result[i].Start).format('DD.MM.YYYY dddd');
                }
            })
            .catch(_.partial(MessageManager.raiseError, 'load', 'reservations'))
            .finally(function () {
                $scope.busy = false;
            });

        $scope.new = function () {
            $location.path('/reservations/new/edit');
        };
        function openEditor(reservation, mode) {
            $location.path('/reservations/' + reservation.AircraftReservationId + '/' + mode);
        }

        $scope.showReservationDetails = function (reservation) {
            openEditor(reservation, 'view');
        };
        $scope.editReservation = function (reservation) {
            openEditor(reservation, 'edit');
        };
        $scope.deleteReservation = function (reservation) {
            ReservationService.delete(reservation, $scope);
        };
    }
}

