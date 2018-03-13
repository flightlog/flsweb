import AuthService from "./AuthService";
import coreModule from "./CoreModule";
import clubsModule from "../masterdata/clubs/ClubsModule";

describe('AuthService', () => {
    let $compile;
    let $rootScope;
    let $httpBackend;
    let AuthService;
    let Clubs;

    beforeEach(() => {
        angular.mock.module(coreModule.name);
        angular.mock.module(clubsModule.name);

        inject((_$rootScope_, _$compile_, _AuthService_, _$httpBackend_, _Clubs_) => {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            AuthService = _AuthService_;
            Clubs = _Clubs_;
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should enable the masterdata features for club admins', () => {
        // arrange
        recordRoleForTestUser("ClubAdministrator");

        // act
        AuthService.login("", "");
        $httpBackend.flush();
        let enabledFeatures = AuthService.getEnabledFeatures();

        // assert
        expect(enabledFeatures.masterdata).toEqual({ persons: true, clubs: true, aircrafts: true, locations: true, users: true, flightTypes: true, memberStates: true, personCategories: true, accountingRuleFilters: true, deliveryCreationTests: true });
        expect(enabledFeatures.system).toEqual(false);
    });

    it('should enable the system features for system admins', () => {
        // arrange
        recordRoleForTestUser("SystemAdministrator");

        // act
        AuthService.login("", "");
        $httpBackend.flush();
        let enabledFeatures = AuthService.getEnabledFeatures();

        // assert
        expect(enabledFeatures.masterdata).toEqual({ persons: true, clubs: true, aircrafts: true, locations: true, users: false, flightTypes: false, memberStates: false, personCategories: false, accountingRuleFilters: false, deliveryCreationTests: false });
        expect(enabledFeatures.system).toEqual(true);
    });

    function recordRoleForTestUser(roleName) {
        $httpBackend.expectPOST(/Token/).respond({});
        $httpBackend.whenGET(/clubs\/my/).respond({
        });
        $httpBackend.whenGET(/users\/my/).respond({
            "UserName": "testuser",
            "UserRoleIds": ["test_role_id"]
        });
        $httpBackend.whenGET(/userroles/).respond([{
            "RoleId": "test_role_id",
            "RoleApplicationKeyString": roleName
        }]);
    }

});
