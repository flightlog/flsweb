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

        let licenseStateSeries = [];

        let idx = 0;
        if (dashboardData.GliderPilotFlightStatisticDashboardDetails
            && !_.isEmpty(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings)
            && !_.isEmpty(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyFlightHours)) {
            series[idx++] = {
                name: "Glider (Anz.)",
                data: this.convertToMonthsArray(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings),
                color: 'rgba(165,170,217,1)',
                pointPadding: 0.38,
                pointPlacement: -0.4
            };
            series[idx++] = {
                name: "Glider (h)",
                data: this.convertToMonthsArray(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyFlightHours),
                color: 'rgba(126,86,134,.9)',
                pointPadding: 0.45,
                pointPlacement: -0.4,
                yAxis: 1
            };

            series[idx++] = {
                name: "Glider (Anz., Vorjahr)",
                data: this.convertToMonthsArray(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyLandings, true),
                color: 'rgba(165,170,217,.5)',
                pointPadding: 0.38,
                pointPlacement: -0.2
            };
            series[idx++] = {
                name: "Glider (h, Vorjahr)",
                data: this.convertToMonthsArray(dashboardData.GliderPilotFlightStatisticDashboardDetails.MonthlyFlightHours, true),
                color: 'rgba(126,86,134,.5)',
                pointPadding: 0.45,
                pointPlacement: -0.2,
                yAxis: 1
            };
        }
        if (dashboardData.MotorPilotFlightStatisticDashboardDetails
            && !_.isEmpty(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyFlightHours)
            && !_.isEmpty(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyLandings)) {
            series[idx++] = {
                name: "Motor (Anz.)",
                data: this.convertToMonthsArray(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyLandings),
                color: 'rgba(100,100,100,.8)',
                pointPadding: 0.38,
                pointPlacement: 0.2
            };
            series[idx++] = {
                name: "Motor (h)",
                data: this.convertToMonthsArray(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyFlightHours),
                color: 'rgba(70,70,70,1)',
                pointPadding: 0.45,
                pointPlacement: 0.2,
                yAxis: 1
            };

            series[idx++] = {
                name: "Motor (Anz., Vorjahr)",
                data: this.convertToMonthsArray(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyLandings, true),
                color: 'rgba(100,100,100,.5)',
                pointPadding: 0.38,
                pointPlacement: 0.4
            };
            series[idx++] = {
                name: "Motor (h, Vorjahr)",
                data: this.convertToMonthsArray(dashboardData.MotorPilotFlightStatisticDashboardDetails.MonthlyFlightHours, true),
                color: 'rgba(70,70,70,.5)',
                pointPadding: 0.45,
                pointPlacement: 0.4,
                yAxis: 1
            };
        }

        if (dashboardData.GliderLicenceStateDetails) {
            licenseStateSeries[0] = {
                name: 'Benötigt',
                color: 'rgba(70,70,70,.5)',
                data: [
                    dashboardData.GliderLicenceStateDetails.FlightTimeInHoursRequired,
                    dashboardData.GliderLicenceStateDetails.LandingsRequired,
                    dashboardData.GliderLicenceStateDetails.NumberOfCheckFlightsRequired
                ],
                pointPadding: 0.1
            };
            licenseStateSeries[1] = {
                name: 'Erreicht',
                color: 'rgba(126,86,134,.9)',
                data: [
                    dashboardData.GliderLicenceStateDetails.FlightTimeInHours,
                    dashboardData.GliderLicenceStateDetails.Landings,
                    dashboardData.GliderLicenceStateDetails.NumberOfCheckFlights
                ],
                pointPadding: 0.3
            };
        }

        let safety = this.calculateSafetyValues(dashboardData.SafetyDashboardDetails);
        let convertToMonthLabel = this.convertToMonthLabel;

        return {
            person: dashboardData.PersonDashboardDetails || {},
            license: dashboardData.GliderLicenceStateDetails || {},
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
                    },

                    plotOptions: {
                        column: {
                            grouping: false,
                            shadow: false,
                            borderWidth: 0
                        }
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
                yAxis: [{
                    min: 0,
                    title: {text: 'Anzahl Flüge'},
                    allowDecimals: false
                }, {
                    min: 0,
                    title: {text: 'Flugstunden'},
                    opposite: true,
                    allowDecimals: false
                }]
            },

            licenseStateConfig: {
                options: {
                    chart: {
                        type: 'column'
                    },

                    plotOptions: {
                        column: {
                            grouping: false,
                            shadow: false,
                            borderWidth: 0
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            let required = this.points[0];
                            let done = this.points[1];
                            return `${this.x}:<br><span style="font-weight:500;">${required.series.name}: ${required.y}<span><br><span style="font-weight:500;">${done.series.name}: ${Math.round(done.y * 10) / 10}<span>`;
                        },
                        shared: true
                    }
                },
                series: licenseStateSeries,
                title: {
                    text: ''
                },
                loading: false,
                xAxis: {
                    categories: ['Flugstunden', 'Landungen', 'Checkflüge']
                },
                yAxis: [
                    {
                        min: 0,
                        title: {text: 'Anzahl'},
                        allowDecimals: false,
                        opposite: true
                    }
                ]
            }
        };
    }

    convertToMonthLabel(monthIndex) {
        return moment().subtract(1, 'year').add(monthIndex, 'month').format("MMM YY");
    }

    convertToMonthsArray(landingsByDate, previousYear) {
        let landingsByMonthCurrentYear = [];
        let landingsByMonthPreviousYear = [];

        let twoYearsAgo = moment().subtract(2, 'year');

        for (let i = 0; i < 12; i++) {
            let monthIndex = 0;
            if (previousYear) {
                monthIndex = moment().subtract(1, 'year').month(parseInt(moment().format("M")) - i - 1).format("YYYYMM");
            } else {
                monthIndex = moment().month(parseInt(moment().format("M")) - i - 1).format("YYYYMM");
            }
            landingsByMonthCurrentYear[monthIndex] = 0;
            landingsByMonthPreviousYear[monthIndex] = 0;
        }

        const oneYearAgo = moment().subtract(1, 'year');
        for (let date in landingsByDate) {
            if (landingsByDate.hasOwnProperty(date)) {
                let flightMoment = moment(date);
                let month = flightMoment.format('YYYYMM');
                if (flightMoment.isAfter(twoYearsAgo) && flightMoment.isBefore(oneYearAgo)) {
                    landingsByMonthPreviousYear[month] = (landingsByMonthCurrentYear[month] || 0) + landingsByDate[date];
                } else if (flightMoment.isAfter(oneYearAgo)) {
                    landingsByMonthCurrentYear[month] = (landingsByMonthCurrentYear[month] || 0) + landingsByDate[date];
                }
            }
        }

        if (previousYear) {
            return this.convertMonthsMapToArray(landingsByMonthPreviousYear);
        } else {
            return this.convertMonthsMapToArray(landingsByMonthCurrentYear);
        }
    }

    convertMonthsMapToArray(landingsByMonth) {
        let months = [];
        for (let month in landingsByMonth) {
            if (landingsByMonth.hasOwnProperty(month)) {
                months.push(month);
            }
        }
        months = months.sort();
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