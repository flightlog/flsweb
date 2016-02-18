import angular from 'angular';
import logsModule from './logs/LogsModule';

export default angular.module('fls.system', [
    logsModule.name
]);
