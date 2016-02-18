import flightsModule from './FlightsModule';

describe('flights controller', function () {
    var $httpBackend, SoloFlightCheckboxEnablementCalculator;

    beforeEach(function () {
        angular.mock.module(flightsModule.name);
        inject(function (_$httpBackend_, _SoloFlightCheckboxEnablementCalculator_) {
            $httpBackend = _$httpBackend_;
            SoloFlightCheckboxEnablementCalculator = _SoloFlightCheckboxEnablementCalculator_;
        });
    });

    function calcCheckbox(flightType) {
        var gliderFlightDetails = {};
        var soloFlightCheckbox = SoloFlightCheckboxEnablementCalculator.getSoloFlightCheckbox(flightType, gliderFlightDetails);
        return soloFlightCheckbox;
    }

    describe('flight type with flags: ', function () {
        it('all flags false should result in undefined and changing allowed', function () {
            var soloFlightCheckbox = calcCheckbox({
                IsSoloFlight: false,
                IsPassengerFlight: false
            });
            expect(soloFlightCheckbox.state).toBe('UNDEFINED');
            expect(soloFlightCheckbox.isChangingAllowed).toBe(true);
        });

        it('soloflight true should result in checked and changing not allowed', function () {
            var soloFlightCheckbox = calcCheckbox({
                IsSoloFlight: true,
                IsPassengerFlight: false
            });
            expect(soloFlightCheckbox.state).toBe('CHECKED');
            expect(soloFlightCheckbox.isChangingAllowed).toBe(false);
        });

        it('passengerflight true should result in unchecked and changing not allowed', function () {
            var soloFlightCheckbox = calcCheckbox({
                IsSoloFlight: false,
                IsPassengerFlight: true
            });
            expect(soloFlightCheckbox.state).toBe('UNCHECKED');
            expect(soloFlightCheckbox.isChangingAllowed).toBe(false);
        });
    });
});