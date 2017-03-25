import angular from 'angular';
import PersonsEditController from './PersonsEditController';
import AddPersonController from './modal/AddPersonController';
import PersonsEditDirective from './PersonsEditDirective';
import PersonFormDirective from './PersonFormDirective';
import * as PersonsServices from './PersonsServices';
import coreModule from '../../core/CoreModule';
import memberStatesModule from '../memberStates/MemberStatesModule';
import {userAuth} from '../../core/AuthService';

export default angular.module('fls.masterdata.persons', [
        coreModule.name,
        memberStatesModule.name
    ])
    .controller('PersonsEditController', PersonsEditController)
    .controller('AddPersonController', AddPersonController)
    .service('PassengerPersister', PersonsServices.PassengerPersister)
    .service('PersonPersister', PersonsServices.PersonPersister)
    .service('Persons', PersonsServices.Persons)
    .service('PagedPersons', PersonsServices.PagedPersons)
    .service('PersonsV2', PersonsServices.PersonsV2)
    .service('PersonService', PersonsServices.PersonService)
    .directive('flsPersons', PersonsEditDirective.factory)
    .directive('flsPersonForm', PersonFormDirective.factory)
    .filter('filterByRequiredFlags', function () {
        return function (persons, requiredFlags) {
            return _.filter(persons, (person) => {
                let matches = true;
                for (let flag in requiredFlags) {
                    matches &= person[flag] || !requiredFlags[flag];
                }
                return matches;
            });
        };
    })
    .config(function ($routeProvider) {
        $routeProvider
            .when('/masterdata/persons',
                {
                    controller: PersonsEditController,
                    template: require('./persons.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "PERSONS"
                    }
                })
            .when('/masterdata/persons/:id',
                {
                    controller: PersonsEditController,
                    template: require('./persons-edit.html'),
                    publicAccess: true,
                    resolve: {
                        user: userAuth,
                        titleKey: () => "PERSONS"
                    }
                });
    });
