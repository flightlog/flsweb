import AirMovementsController from "./AirMovementsController";
import airMovementsModule from "./AirMovementsModule";
import TimeService from "../../core/TimeService";
import AuthService from "../../core/AuthService";
import DropdownItemsRenderService from "../../core/DropdownItemsRenderService";

describe('AirMovementsController', () => {
    let $scope;

    beforeEach(() => {
        angular.mock.module(airMovementsModule.name, ($provide) => {
            $provide.service('$scope', {});
        });

    });

    it('should format long time', () => {
        // arrange
        $scope = scope();

        // act
        let result = timeService().formatTime('12345');

        // assert
        expect(result).toBe('123:45');
    });

    it('should reset block end time if negative', (TimerSet) => {
        // arrange
        $scope = scope();
        $scope.timesSets = {
            engine: new TimerSet()
        };
        new AirMovementsController($scope, q(), timeout(), timeService(), renderer(), authService(), {}, ngTableParams(), tableSettingsCacheFactory());
        $scope.operatingCounters = {
            EngineOperatingCounterUnitTypeKeyName: "Min"
        };
        $scope.times = {};
        $scope.flightDetails = {
            MotorFlightDetailsData: {
                EngineStartOperatingCounterInSeconds: 300,
                EngineEndOperatingCounterInSeconds: 200
            }
        };

        // act
        $scope.engineSecondsCountersChanged();

        // assert
        expect($scope.times.engineSecondsCounterDuration).toBe(0);
    });

    it('should calculate block duration for high counter states', (TimerSet) => {
        // arrange
        $scope = scope();
        $scope.timesSets = {
            engine: new TimerSet()
        };
        new AirMovementsController($scope, q(), timeout(), timeService(), renderer(), authService(), {}, ngTableParams(), tableSettingsCacheFactory());
        $scope.operatingCounters = {
            EngineOperatingCounterUnitTypeKeyName: "Min"
        };
        $scope.times = {};
        $scope.flightDetails = {
            MotorFlightDetailsData: {
                EngineStartOperatingCounterInSeconds: 300,
                EngineEndOperatingCounterInSeconds: 1800
            }
        };

        // act
        $scope.engineSecondsCountersChanged();

        // assert
        expect($scope.times.engineSecondsCounterDuration).toBe(1500);
    });

    function q() {
        let $q = jasmine.createSpyObj("$q", ["when", "defer"]);
        $q.when.and.callFake(() => {
            return {};
        });
        $q.defer.and.callFake(() => {
            return {};
        });
        return $q;
    }

    function scope() {
        return {
            times: {}
        };
    }

    function timeout() {
        return () => {
        };
    }

    function timeService() {
        return new TimeService();
    }

    function renderer() {
        return new DropdownItemsRenderService();
    }

    function authService() {
        return new AuthService({
            defaults: {headers: {common: {}}}
        }, {}, {}, {}, {
            $default: () => {
                return {loginResult: {}};
            }
        });
    }

    function ngTableParams() {
        return () => {
        }
    }

    function tableSettingsCacheFactory() {
        return {
            getSettingsCache: () => {
                return {
                    currentSettings: () => {
                        return {};
                    }
                }
            }
        };
    }
});
