import angular from "angular";
import constants from "./Constants";
import AuthService from "./AuthService";
import MessageManager from "./MessageManager";
import TimeService from "./TimeService";
import NavigationCache from "./NavigationCache";
import Countries from "./Countries";
import {StartTypes, SpecificStartTypes} from "./StartTypes";
import {CounterUnitTypes} from "./CounterUnitTypes";
import DatePickerInputDirective from "./directives/datePicker/DatePickerInputDirective";
import DateRangePickerInputDirective from "./directives/dateRangePicker/DateRangePickerInputDirective";
import TimeInputDirective from "./directives/timePicker/TimeInputDirective";
import TimeCounterDirective from "./directives/timeCounter/TimeCounterDirective";
import MessageBarDirective from "./directives/messageBar/MessageBarDirective";
import SearchBarDirective from "./directives/searchBar/SearchBarDirective";
import SimpleSearchBarDirective from "./directives/simpleSearchBar/SimpleSearchBarDirective";
import NavigationBarDirective from "./directives/navigationBar/NavigationBarDirective";
import DataTableDirective from "./directives/dataTable/DataTableDirective";
import CheckBoxDirective from "./directives/checkBox/CheckBoxDirective";
import LabelledCheckBoxDirective from "./directives/checkBox/LabelledCheckBoxDirective";
import BusyIndicatorDirective from "./directives/busyIndicator/BusyIndicatorDirective";
import HistoryDirective from "./directives/history/HistoryDirective";
import AuditLogService from "./directives/history/AuditLogService";
import DropdownItemsRenderService from "./DropdownItemsRenderService";
import SelectizeDirective from "./directives/Selectize";
import StringUtils from "./StringUtils";
import {TableSettingsCacheFactory} from "./TableSettingsCache";
import angularCookies from "angular-cookies";
import angularResource from "angular-resource";
import ngStorage from "ngstorage";
import angularRoute from "angular-route";
import angularMoment from "angular-moment";
import "pikaday-angular";
import "ng-table";

export default angular.module("fls.core", [
    angularRoute,
    angularMoment.name,
    "pikaday",
    'ngTable',
    ngStorage.name,
    angularCookies,
    angularResource
])
    .constant('GLOBALS', constants)
    .value('selectizeConfig', {})
    .directive('searchBar', SearchBarDirective.factory)
    .directive('flsDatePicker', DatePickerInputDirective.factory)
    .directive('flsDateRangePicker', DateRangePickerInputDirective.factory)
    .directive('flsTimeInput', TimeInputDirective.factory)
    .directive('flsTimeCounter', TimeCounterDirective.factory)
    .directive('flsSimpleSearchBar', SimpleSearchBarDirective.factory)
    .directive('flsMessageBar', MessageBarDirective.factory)
    .directive('flsNavigationBar', NavigationBarDirective.factory)
    .directive('flsDataTable', DataTableDirective.factory)
    .directive('flsBusyIndicator', BusyIndicatorDirective.factory)
    .directive('flsCheckbox', CheckBoxDirective.factory)
    .directive('flsLabelledCheckbox', LabelledCheckBoxDirective.factory)
    .directive('selectize', SelectizeDirective.factory)
    .directive('flsHistory', HistoryDirective.factory)
    .service('StringUtils', StringUtils)
    .service('TableSettingsCacheFactory', TableSettingsCacheFactory)
    .service('AuthService', AuthService)
    .service('MessageManager', MessageManager)
    .service('NavigationCache', NavigationCache)
    .service('Countries', Countries)
    .service('StartTypes', StartTypes)
    .service('CounterUnitTypes', CounterUnitTypes)
    .service('AuditLogService', AuditLogService)
    .service('SpecificStartTypes', SpecificStartTypes)
    .service('TimeService', TimeService)
    .service('DropdownItemsRenderService', DropdownItemsRenderService)
    .config((pikadayConfigProvider, ngTableFilterConfigProvider) => {
        ngTableFilterConfigProvider.setConfig({
            aliasUrls: {
                "date": "./tableFilters/date-filter.html"
            }
        });

        pikadayConfigProvider.setConfig({
            firstDay: 1,
            format: "DD.MM.YYYY",
            setDefaultDate: true,
            yearRange: [1900, 2050],
            theme: "fls-theme"
        });
    })
    .run(($templateCache) => {
        $templateCache.put("./tableFilters/date-filter.html", require("./tableFilters/date-filter.html"));
    });
