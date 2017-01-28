import moment from "moment";

export default class ReservationsController {
    constructor($scope, $location, AuthService, ReservationService, PagedReservations, NavigationCache, NgTableParams) {
        NavigationCache.setCancellingLocationHere();
        $scope.isReservationAdmin = AuthService.isClubAdmin();
        $scope.busy = false;
        $scope.tableParams = new NgTableParams({
            filter: {},
            sorting: {
                Start: 'desc'
            },
            count: 100
        }, {
            counts: [],
            getData: function (params) {
                let pageSize = params.count();
                let pageStart = (params.page() - 1) * pageSize;

                return PagedReservations.getReservations($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                    .then((res) => {
                        params.total(res.TotalRows);

                        let result = res.Items;
                        let formattedResult = [];
                        for (var i = 0; i < result.length; i++) {
                            formattedResult[i] = Object.assign(result[i], {
                                _formattedDate: result[i].Start && moment(result[i].Start).format('DD.MM.YYYY dddd'),
                                Start: moment(result[i].Start).toDate(),
                                End: moment(result[i].End).toDate()
                            });
                        }

                        return formattedResult;
                    });
            }
        });

        $scope.new = function () {
            $location.path('/reservations/new/edit');
        };
        function openEditor(reservation, mode) {
            $location.path('/reservations/' + reservation.AircraftReservationId + '/' + mode);
        }

        $scope.showReservationDetails = (reservation) => {
            openEditor(reservation, 'view');
        };
        $scope.editReservation = (reservation) => {
            openEditor(reservation, 'edit');
        };
        $scope.deleteReservation = (reservation, $event) => {
            $event.stopPropagation();
            let deletedPromise = ReservationService.delete(reservation, $scope);
            if (deletedPromise) {
                deletedPromise.then(() => {
                    $scope.tableParams.reload();
                });
            }
        };
    }
}

