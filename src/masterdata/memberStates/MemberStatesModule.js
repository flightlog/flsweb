import angular from 'angular';
import coreModule from '../../core/CoreModule';
import MemberStatesEditController from './MemberStatesEditController';
import MemberStatesEditDirective from './MemberStatesEditDirective';
import MemberStateFormDirective from './MemberStateFormDirective';
import * as MemberStatesServices from './MemberStatesServices';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.memberStates', [
        coreModule.name
    ])
    .directive('flsMemberStates', MemberStatesEditDirective.factory)
    .directive('flsMemberStateForm', MemberStateFormDirective.factory)
    .service('MemberState', MemberStatesServices.MemberState)
    .service('MemberStates', MemberStatesServices.MemberStates)
    .service('MemberStateService', MemberStatesServices.MemberStateService)
    .controller('MemberStatesEditController', MemberStatesEditController)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/memberStates',
                {
                    controller: MemberStatesEditController,
                    template: require('./member-states.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "MEMBER_STATE"
                    }
                })
            .when('/masterdata/memberStates/:id',
                {
                    controller: MemberStatesEditController,
                    template: require('./member-states-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "MEMBER_STATE"
                    }
                });
    });

