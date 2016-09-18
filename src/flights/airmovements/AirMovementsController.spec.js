import AirMovementsController from "./AirMovementsController";
import airMovementsModule from "./AirMovementsModule";
import TimeService from "../../core/TimeService";
import DropdownItemsRenderService from "../../core/DropdownItemsRenderService";
import moment from "moment";

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

    it('should reset block end time if negative', () => {
        // arrange
        $scope = scope();
        new AirMovementsController($scope, q(), timeout(), timeService(), renderer());
        $scope.times.engineCounterBegin = '100:00';
        $scope.times.engineCounterEnd = '50:00';

        // act
        $scope.engineMinutesCountersChanged();

        // assert
        expect($scope.times.engineDuration).toBe('');
    });

    it('should calculate block duration for high counter states', () => {
        // arrange
        $scope = scope();
        new AirMovementsController($scope, q(), timeout(), timeService(), renderer());
        $scope.times.engineCounterBegin = '1200:00';
        $scope.times.engineCounterEnd = '1203:50';

        // act
        $scope.engineMinutesCountersChanged();

        // assert
        expect($scope.times.engineDuration).toBe('3:50');
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

});
