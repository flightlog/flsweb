import * as angular from "angular";
import {FlightStateMapper} from "./FlightsServices";

export default class AirStateFilterDropdownDirective {
    static factory() {
        return {
            restrict: 'E',
            require: '^ngModel',
            template: `
                <div>
                    <input class="form-control" ng-model="filterIndicator" ng-click="toggleEditor()" readonly>
                    <div ng-if="editorVisible"
                         class="filter-choice-dropdown">
                        <div class="filter-choices">
                            <div class="filter-choice-list">
                                <label translate="FLIGHT_STATES"></label>
                                <ul>
                                   <li><span class="lnr lnr-hand glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.ready" ng-click="updateIndicator()"> <span translate="FLIGHT_READY"></span></li>
                                   <li><span class="fa fa-cloud glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.inAir" ng-click="updateIndicator()"> <span translate="FLIGHT_IN_AIR"></span></li>
                                   <li><span class="lnr lnr-checkmark-circle glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.landed" ng-click="updateIndicator()"> <span translate="FLIGHT_LANDED"></span></li>
                                </ul>
                            </div>
                        </div>
                        <button class="btn btn-default pull-right" style="margin-top:10px;" ng-click="toggleEditor()" translate="CLOSE"></button>
                        <button class="btn btn-default pull-left" style="margin-top:10px;" ng-click="reset()" translate="ALL"></button>
                    </div>
                </div>
            `,
            scope: {
                ngModel: '=',
                field: '@'
            },
            link: function (scope, element, attrs, modelCtrl) {
                scope.states = scope.ngModel || Object.assign({}, FlightStateMapper.allAirStates());

                scope.updateIndicator = () => {
                    if(FlightStateMapper.anyStateDisabled(scope.states.flight)) {
                        scope.filterIndicator = "*";
                    } else {
                        scope.filterIndicator = "";
                    }
                    modelCtrl.$setViewValue(scope.states);
                };

                scope.reset = () => {
                    scope.states = Object.assign({}, FlightStateMapper.allAirStates());
                    scope.updateIndicator();
                };

                scope.toggleEditor = () => {
                    scope.editorVisible = !scope.editorVisible;
                };
                

                scope.updateIndicator();
            }
        };
    };
}
