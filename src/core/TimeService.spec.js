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

});
