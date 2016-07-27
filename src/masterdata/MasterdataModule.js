import angular from 'angular';
import personsModule from './persons/PersonsModule';
import clubsModule from './clubs/ClubsModule';
import locationsModule from './locations/LocationsModule';
import aircraftsModule from './aircrafts/AircraftsModule';
import flightTypesModule from './flightTypes/FlightTypesModule';
import usersModule from './users/UsersModule';
import memberStatesModule from './memberStates/MemberStatesModule';

export default angular.module('fls.masterdata', [
    personsModule.name,
    clubsModule.name,
    locationsModule.name,
    usersModule.name,
    aircraftsModule.name,
    flightTypesModule.name,
    memberStatesModule.name
]);
