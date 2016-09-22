import coreModule from "../../CoreModule";
import moment from "moment";

describe('Time Counter Directive', () => {
    let $compile;
    let $rootScope;

    beforeEach(() => {
        angular.mock.module(coreModule.name);

        inject((_$rootScope_, _$compile_) => {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
        });
    });

    it('shows the input field with the model value in Min format', () => {
        // arrange
        let scope = $rootScope.$new();
        scope.testSeconds = 150 * 60;
        scope.format = 'Min';
        let element = $compile("<input fls-time-counter type='text' ng-model='testSeconds' time-format='format'>")(scope);

        // act
        scope.$digest();
        element.blur();

        // assert
        expect(element.val()).toBe("2:30");
    });

    it('shows the input field with the model value in decimal format', () => {
        // arrange
        let scope = $rootScope.$new();
        scope.testSeconds = 150 * 60;
        scope.format = '2decimalsperhour';
        let element = $compile("<input fls-time-counter type='text' ng-model='testSeconds' time-format='format'>")(scope);

        // act
        scope.$digest();
        element.blur();

        // assert
        expect(element.val()).toBe("2.50");
    });

    it('changes the placeholder if format is changed', () => {
        // arrange
        let scope = $rootScope.$new();
        scope.testSeconds = 150 * 60;
        scope.format = 'Min';
        let element = $compile("<input fls-time-counter type='text' ng-model='testSeconds' time-format='format'>")(scope);

        // act
        scope.$digest();
        expect(element.attr("placeholder")).toBe("hhhh:mm");
        expect(element.val()).toBe("2:30");
        scope.format = '2decimalsperhour';
        scope.$digest();

        // assert
        expect(element.attr("placeholder")).toBe("hhhh.mm");
        expect(element.val()).toBe("2.50");
    });

});
