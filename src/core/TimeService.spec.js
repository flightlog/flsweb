import AuthService from "./AuthService";
import coreModule from "./CoreModule";

describe('TimeService', () => {
    let TimeService;

    beforeEach(() => {
        angular.mock.module(coreModule.name);

        inject((_TimeService_) => {
            TimeService = _TimeService_;
        });
    });

    it('should remove timezone offset', () => {
        // arrange
        let dt = new Date(1000000000);

        // act
        let result = TimeService.removeTimeOffset(dt);

        // assert
        expect(JSON.stringify(result)).toEqual('"1970-01-12T00:00:00.000Z"');
    });

    it('should stay undefined', () => {
        // arrange
        let dt = undefined;

        // act
        let result = TimeService.removeTimeOffset(dt);

        // assert
        expect(result).toBeUndefined();
    });

    it('should format minutes format', () => {
        // arrange
        let seconds = 120 * 60;

        // act
        let result = TimeService.formatSecondsToLongHoursFormat(seconds);

        // assert
        expect(JSON.stringify(result)).toEqual('"2:00"');
    });

    it('should format decimal format', () => {
        // arrange
        let seconds = 120 * 60 + 40;

        // act
        let result = TimeService.formatSecondsToLongHoursFormat(seconds, "2decimalsperhour");

        // assert
        expect(JSON.stringify(result)).toEqual('"2.01"');
    });

    it('should format decimal format and round correctly', () => {
        // arrange
        let seconds = TimeService.longDurationFormatToSeconds("100.92", "2decimalsperhour");

        // act
        let result = TimeService.formatSecondsToLongHoursFormat(seconds, "2decimalsperhour");

        // assert
        expect(JSON.stringify(result)).toEqual('"100.92"');
    });

    it('should format empty string to undefined', () => {
        // arrange + act
        let res = TimeService.formatTime("");

        // assert
        expect(res).toBeUndefined();
    });

    it('should format time with point to correct time', () => {
        // arrange + act
        let res = TimeService.formatTime("2.54");

        // assert
        expect(res).toBe("2:54");
    });

});
