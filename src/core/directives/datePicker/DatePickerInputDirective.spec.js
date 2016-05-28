import coreModule from "../../CoreModule";
import moment from "moment";

describe('Date Picker Input Directive', () => {
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
        scope.testDate = new Date(0);
        let element = $compile("<fls-date-picker ng-model='testDate'></fls-busy-indicator>")(scope);

        // act
        scope.$digest();

        // assert
        expect(element.find("input").val()).toBe(moment(scope.testDate).format("DD.MM.YYYY"));
    });

});
