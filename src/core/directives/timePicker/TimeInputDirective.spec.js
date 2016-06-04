import coreModule from "../../CoreModule";
import moment from "moment";

describe('Time Input Directive', () => {
    let $compile;
    let $rootScope;

    beforeEach(() => {
        angular.mock.module(coreModule.name);

        inject((_$rootScope_, _$compile_) => {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
        });
    });

    it('shows the input field with the model value', () => {
        // arrange
        let scope = $rootScope.$new();
        scope.testDate = new Date(5200000);
        let element = $compile("<input fls-time-input type='text' ng-model='testDate'></fls-busy-indicator>")(scope);

        // act
        scope.$digest();

        // assert
        expect(element.val()).toBe("02:26");
    });

});
