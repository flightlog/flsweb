import reservationsModule from './ReservationsModule';

describe('reservation validator', function () {
    var ReservationValidator;

    beforeEach(() => {
        angular.mock.module(reservationsModule.name)
        inject(function (_ReservationValidator_) {
            ReservationValidator = _ReservationValidator_;
        });
    });

    describe('no types', function () {
        it('should result in undefined requirement', function () {
            var types = [];
            var reservation = {};
            var required = ReservationValidator.calculateInstructorRequired(types, reservation);
            expect(required).toBeUndefined();
        });
    });

    describe('type which requires instructur', function () {
        it('should result in "required"', function () {
            var reservation = {
                ReservationTypeId: 1
            };
            var types = [
                {
                    IsInstructorRequired: true,
                    AircraftReservationTypeId: reservation.ReservationTypeId
                }
            ];
            var required = ReservationValidator.calculateInstructorRequired(types, reservation);
            expect(required).toBe(true);
        });
    });

    describe('type which is not selected', function () {
        it('should have no influence', function () {
            var reservation = {
                ReservationTypeId: 1
            };
            var types = [
                {
                    IsInstructorRequired: 'thisshouldmatch',
                    AircraftReservationTypeId: reservation.ReservationTypeId
                },
                {
                    IsInstructorRequired: true,
                    AircraftReservationTypeId: 2
                }
            ];
            var required = ReservationValidator.calculateInstructorRequired(types, reservation);
            expect(required).toBe('thisshouldmatch');
        });
    });
});