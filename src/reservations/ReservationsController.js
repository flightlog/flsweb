import moment from "moment";

export default class ReservationsController {
    constructor($scope, $location, AuthService, ReservationService, PagedReservations, NavigationCache, NgTableParams, TableSettingsCacheFactory) {
        NavigationCache.setCancellingLocationHere();
        $scope.isReservationAdmin = AuthService.isClubAdmin();
        $scope.busy = false;


        let tableSettingsCache = TableSettingsCacheFactory.getSettingsCache("ReservationsController", {
            filter: {
                Start: {
                    From: moment().format("YYYY-MM-DD")
                }
            },
            sorting: {
                Start: 'asc'
            },
            count: 100
        });

        $scope.tableParams = new NgTableParams(tableSettingsCache.currentSettings(), {
            counts: [],
            getData: function (params) {
                $scope.busy = true;
                let pageSize = params.count();
                let pageStart = (params.page() - 1) * pageSize;

                return PagedReservations.getReservations($scope.tableParams.filter(), $scope.tableParams.sorting(), pageStart, pageSize)
                    .then((res) => {
                        $scope.busy = false;
                        tableSettingsCache.update($scope.tableParams.filter(), $scope.tableParams.sorting());
                        params.total(res.TotalRows);

                        let result = res.Items;
                        let formattedResult = [];
                        for (let i = 0; i < result.length; i++) {
                            formattedResult[i] = Object.assign(result[i], {
                                _formattedDate: result[i].Start && moment(result[i].Start).format('DD.MM.YYYY dddd'),
                                Start: moment(result[i].Start).toDate(),
                                End: moment(result[i].End).toDate()
                            });
                        }

                        return formattedResult;
                    })
                    .finally(() => {
                        $scope.busy = false;
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

