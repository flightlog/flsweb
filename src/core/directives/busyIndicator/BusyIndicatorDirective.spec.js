import coreModule from "../../CoreModule";

describe('Busy Indicator Directive', () => {
    let $compile;
    let $rootScope;

    beforeEach(() => {
        angular.mock.module(coreModule.name);

        inject((_$rootScope_, _$compile_) => {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
        });
    });

    it('shows busy indicator in case it is busy', () => {
        // arrange
        let scope = $rootScope.$new();
        let element = $compile("<fls-busy-indicator busy='true'></fls-busy-indicator>")(scope);

        // act
        scope.$digest();

        // assert
        expect(element.find('div.ng-hide').html()).toBeUndefined();
    });

    it('hides busy indicator in case it is not busy', () => {
        // arrange
        let scope = $rootScope.$new();
        let element = $compile("<fls-busy-indicator busy='false'></fls-busy-indicator>")(scope);

        // act
        scope.$digest();

        // assert
        expect(element.find('div.ng-hide').html()).toMatch(/(class="cssload-loader")+/);
    });

    it('hides busy indicator in case it has an error', () => {
        // arrange
        let scope = $rootScope.$new();
        let element = $compile("<fls-busy-indicator busy='false' error='true'></fls-busy-indicator>")(scope);

        // act
        scope.$digest();

        // assert
        expect(element.find('div.ng-hide').html()).toMatch(/(class="cssload-loader")+/);
    });

});
