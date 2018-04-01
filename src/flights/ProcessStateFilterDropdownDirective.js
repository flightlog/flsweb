import * as angular from "angular";
import {FlightStateMapper} from "./FlightsServices";

export default class ProcessStateFilterDropdownDirective {
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
                                <label translate="PROCESS_STATUS"></label>
                                <ul>
                                   <li><span class="fa fa-check-circle glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.valid" ng-click="updateIndicator()"> <span translate="FLIGHT_VALID"></span></li>
                                   <li><span class="lnr lnr-warning glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.invalid" ng-click="updateIndicator()"> <span translate="FLIGHT_INVALID"></span></li>
                                   <li><span class="lnr lnr-lock glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.locked" ng-click="updateIndicator()"> <span translate="FLIGHT_LOCKED"></span></li>
                                   <li><span class="lnr lnr-alarm glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.deliverypreparationerror" ng-click="updateIndicator()"> <span translate="FLIGHT_DELIVERYPREPARATIONERROR"></span></li>
								   <li><span class="lnr lnr-link glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.deliveryprepared" ng-click="updateIndicator()"> <span translate="FLIGHT_DELIVERYPREPARED"></span></li>
								   <li><span class="lnr lnr-sync glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.deliverybooked" ng-click="updateIndicator()"> <span translate="FLIGHT_DELIVERYBOOKED"></span></li>
								   <li><span class="lnr lnr-cross glider-state-icon"></span> <input type="checkbox" ng-model="states.flight.excludedfromdeliveryprocess" ng-click="updateIndicator()"> <span translate="FLIGHT_EXCLUDEDFROMDELIVERYPROCESS"></span></li>
                                </ul>
                            </div>
                        </div>
                        <button class="btn btn-default pull-right" style="margin-top:10px;" ng-click="toggleEditor()" translate="CLOSE"></button>
                        <button class="btn btn-default pull-left" style="margin-top:10px;" ng-click="reset()" translate="ALL"></button>
                    </div>
                </div>
            `,
            scope: {
                ngModel: '='
            },
            link: function (scope, element, attrs, modelCtrl) {
                scope.states = scope.ngModel || Object.assign({}, FlightStateMapper.allProcessStates());

                scope.updateIndicator = () => {
                    if(FlightStateMapper.anyStateDisabled(scope.states.flight)) {
                        scope.filterIndicator = "*";
                    } else {
                        scope.filterIndicator = "";
                    }
                    modelCtrl.$setViewValue(scope.states);
                };

                scope.reset = () => {
                    scope.states = Object.assign({}, FlightStateMapper.allProcessStates());
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
