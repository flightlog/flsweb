import * as _ from "lodash";
import moment from "moment";


export class DashboardService {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/dashboards', null, {
            query: {
                method: 'GET',
                isArray: false,
                cache: false
            }
        });
    }
}


export class DashboardDataModelAdapter {

    constructor() {
        moment.locale("de");
    }

    compileMyDashboardConfig(dashboardData) {

        let series = [];

        let monthIndexes = [];
        for (let i = 0; i < 12; i++) {
            monthIndexes[i] = i + 1;
        }

        let idx = 0;
        if (dashboardData.GliderPilotFlightStatisticDashboardDetails && !_.isEmpty(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings)) {
            series[idx++] = {
                name: "Segelflug",
                data: this.convertToMonthsArray(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings)
            };
        }
        if (dashboardData.MotorPilotFlightStatisticDashboardDetails && !_.isEmpty(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyLandings)) {
            series[idx++] = {
                name: "Motorflug",
                data: this.convertToMonthsArray(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyLandings)
            };
        }

        let safety = this.calculateSafetyValues(dashboardData.SafetyDashboardDetails);
        let convertToMonthLabel = this.convertToMonthLabel;

        return {
            person: dashboardData.PersonDashboardDetails || {},
            safety: safety,
            safetyGauge: {
                options: {
                    chart: {
                        type: 'solidgauge'
                    },

                    pane: {
                        center: ['50%', '85%'],
                        size: '140%',
                        startAngle: -90,
                        endAngle: 90,
                        background: {
                            backgroundColor: '#EEE',
                            innerRadius: '60%',
                            outerRadius: '100%',
                            shape: 'arc'
                        }
                    }
                },
                series: [{
                    data: [safety.safetyPercentage],
                    dataLabels: {
                        format: '<div></div>'
                    }
                }],
                title: {
                    text: ''
                },
                loading: false,
                yAxis: {
                    min: 0,
                    max: 100,
                    stops: [
                        [0.3, '#DF5353'], // red
                        [0.5, '#DDDF0D'], // yellow
                        [0.8, '#55BF3B'] // green
                    ]
                }
            },

            flightsChartConfig: {
                options: {
                    chart: {
                        type: 'column'
                    }
                },
                series: series,
                title: {
                    text: ''
                },
                loading: false,
                xAxis: {
                    categories: monthIndexes,
                    labels: {
                        formatter: function () {
                            return convertToMonthLabel(this.value);
                        }
                    }
                },
                yAxis: {
                    title: {text: 'Anzahl Flüge'},
                    allowDecimals: false
                }
            }
        };
    }

    convertToMonthLabel(monthIndex) {
        return moment().subtract(1, 'year').add(monthIndex, 'month').format("MMMM YYYY");
    }

    convertToMonthsArray(landingsByDate) {
        let oneYearAgo = moment().subtract(1, 'year');
        let landingsByMonth = [];
        for (let i = 0; i < 12; i++) {
            landingsByMonth[moment().month(parseInt(moment().format("M")) - i - 1).format("YYYYMM")] = 0;
        }
        for (let date in landingsByDate) {
            if (landingsByDate.hasOwnProperty(date)) {
                var flightMoment = moment(date);
                if(flightMoment.isAfter(oneYearAgo)) {
                    let month = flightMoment.format('YYYYMM');
                    landingsByMonth[month] = (landingsByMonth[month] || 0) + landingsByDate[date];
                }
            }
        }

        let months = [];
        for (let month in landingsByMonth) {
            if (landingsByMonth.hasOwnProperty(month)) {
                months.push(month);
            }
        }
        months.sort();
        let monthlyLandingsArray = [];
        for (let i = 0; i < months.length; i++) {
            let month = months[i];
            monthlyLandingsArray[i] = landingsByMonth[month];
        }
        return monthlyLandingsArray;
    }

    calculateSafetyValues(SafetyDashboardDetails) {
        let flightTimeInHours = SafetyDashboardDetails && SafetyDashboardDetails.FlightTimeInHours || 0;
        let numStarts = SafetyDashboardDetails && SafetyDashboardDetails.Starts || 0;

        let percentageFlightTime = (100 / 30 * flightTimeInHours);
        let percentageNumStarts = (100 / 42 * numStarts);
        let safetyPercentage = (percentageFlightTime + percentageNumStarts) / 2;
        let labelKey = "UNKNOWN";

        if (safetyPercentage > 33 && safetyPercentage < 66) {
            labelKey = "YELLOW";
        } else if (safetyPercentage > 66) {
            labelKey = "GREEN";
        } else {
            labelKey = "RED";
        }

        return {
            safetyPercentage: Math.min(100, Math.round(safetyPercentage * 100) / 100),
            starts: numStarts,
            hours: Math.round(flightTimeInHours),
            labelKey: labelKey
        };
    }
}