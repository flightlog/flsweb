import angular from 'angular';
import coreModule from '../core/CoreModule';
import personsModule from './persons/PersonsModule';
import clubsModule from './clubs/ClubsModule';
import locationsModule from './locations/LocationsModule';
import aircraftsModule from './aircrafts/AircraftsModule';
import flightTypesModule from './flightTypes/FlightTypesModule';
import usersModule from './users/UsersModule';
import memberStatesModule from './memberStates/MemberStatesModule';
import accountingRuleFiltersModule from './accountingRules/AccountingRuleFiltersModule';
import deliveryCreationTestsModule from './deliveryCreationTests/DeliveryCreationTestsModule';
import personCategoriesModule from './personCategories/PersonCategoryModule';
import 'ng-table';

export default angular.module('fls.masterdata', [
    'ngTable',
    coreModule.name,
    personsModule.name,
    clubsModule.name,
    locationsModule.name,
    usersModule.name,
    aircraftsModule.name,
    flightTypesModule.name,
    memberStatesModule.name,
    accountingRuleFiltersModule.name,
    deliveryCreationTestsModule.name,
    personCategoriesModule.name
]);
