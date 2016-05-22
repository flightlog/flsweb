import {DashboardDataModelAdapter} from "./DashboardServices";
import mainModule from "../MainModule";
import moment from "moment";

describe('DashboardDataModelAdapter Directive', () => {
    let $compile;
    let $rootScope;
    let dashboardDataModelAdapter;

    beforeEach(() => {
        angular.mock.module(mainModule.name);

        inject((_$rootScope_, _$compile_, _dashboardDataModelAdapter_) => {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            dashboardDataModelAdapter = _dashboardDataModelAdapter_
        });
    });

    it('should convert to index based months array and skip flights which are older than a year', () => {
        // arrange
        let flightsArray = [];
        flightsArray["2000-02-01T00:00:00"] = 11;
        flightsArray["2000-03-01T00:00:00"] = 11;
        flightsArray[moment().format("YYYY-MM-DD")] = 3;
        flightsArray[moment().subtract(4, "month").format("YYYY-MM-DD")] = 2;
        let dashboardConfig = {
            "GliderPilotFlightStatisticDashboardDetails": {
                "MonthlyLandings": flightsArray
            }
        };

        // act
        let result = dashboardDataModelAdapter.convertToMonthsArray(dashboardConfig.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings);

        // assert
        expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3]);
    });

    it('should convert to index based months array for previous year and skip flights which are newer than a year and older than 2 years', () => {
        // arrange
        let flightsArray = [];
        flightsArray["2000-02-01T00:00:00"] = 11;
        flightsArray["2000-03-01T00:00:00"] = 11;
        flightsArray[moment().add(-1, "year").format("YYYY-MM-DD")] = 3;
        flightsArray[moment().add(-1, "year").subtract(4, "month").format("YYYY-MM-DD")] = 2;
        let dashboardConfig = {
            "GliderPilotFlightStatisticDashboardDetails": {
                "MonthlyLandings": flightsArray
            }
        };

        // act
        let result = dashboardDataModelAdapter.convertToMonthsArray(dashboardConfig.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings, true);

        // assert
        expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3]);
    });

    it('should convert the landings from previous year to the correct array', () => {
        let flightsArray = [];
        flightsArray["2000-02-01T00:00:00"] = 11;
        flightsArray["2000-03-01T00:00:00"] = 11;
        flightsArray[moment().subtract(2, "month").format("YYYY-MM-DD")] = 1;
        flightsArray[moment().subtract(3, "month").format("YYYY-MM-DD")] = 2;
        flightsArray[moment().subtract(1, "year").subtract(2, "month").format("YYYY-MM-DD")] = 1;
        let dashboardConfig = {
            "GliderPilotFlightStatisticDashboardDetails": {
                "MonthlyLandings": flightsArray
            }
        };

        // act
        let currentYear = dashboardDataModelAdapter.convertToMonthsArray(dashboardConfig.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings);
        let previousYear = dashboardDataModelAdapter.convertToMonthsArray(dashboardConfig.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings, true);

        // assert
        expect(currentYear).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0]);
        expect(previousYear).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
    });

    it('last index should convert current month label', () => {
        // arrange
        var monthIndex = 12;

        // act
        let result = dashboardDataModelAdapter.convertToMonthLabel(monthIndex);

        // assert
        expect(result).toEqual(moment().format("MMM YY"));
    });

    it('should calculate the safety values for unsafe pilots', () => {
        // arrange
        let dashboardConfig = {
            "SafetyDashboardDetails": {
                "Starts": 4,
                "FlightTimeInHours": 16.166666666666664,
                "StatisticBasedOnLastMonths": 6
            }
        };

        // act
        let result = dashboardDataModelAdapter.calculateSafetyValues(dashboardConfig.SafetyDashboardDetails);

        // assert
        expect(result).toEqual({
            safetyPercentage: 31.71,
            starts: 4,
            hours: 16,
            labelKey: 'RED'
        });
    });

    it('should calculate the safety values for safe pilots', () => {
        // arrange
        let dashboardConfig = {
            "SafetyDashboardDetails": {
                "Starts": 42,
                "FlightTimeInHours": 30,
                "StatisticBasedOnLastMonths": 6
            }
        };

        // act
        let result = dashboardDataModelAdapter.calculateSafetyValues(dashboardConfig.SafetyDashboardDetails);

        // assert
        expect(result).toEqual({
            safetyPercentage: 100,
            starts: 42,
            hours: 30,
            labelKey: 'GREEN'
        });
    });

    it('should calculate the safety values for medium pilots', () => {
        // arrange
        let dashboardConfig = {
            "SafetyDashboardDetails": {
                "Starts": 27,
                "FlightTimeInHours": 2,
                "StatisticBasedOnLastMonths": 6
            }
        };

        // act
        let result = dashboardDataModelAdapter.calculateSafetyValues(dashboardConfig.SafetyDashboardDetails);

        // assert
        expect(result).toEqual({
            safetyPercentage: 35.48,
            starts: 27,
            hours: 2,
            labelKey: 'YELLOW'
        });
    });

});
