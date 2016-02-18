import * as _ from 'lodash';
import moment from 'moment';

export default class SearchBarDirective {
    static factory(GLOBALS, Clubs, Locations, AuthService, MessageManager) {
        return {
            restrict: 'E',
            scope: {
                searchString: '='
            },
            template: require('./search-bar-directive.html'),
            link: function (scope/*, element, attrs*/) {
                scope.debug = GLOBALS.DEBUG;

                scope.todayFormatted = moment().format('DD.MM.YYYY');
                scope.monthFormatted = moment().format('MM.YYYY');
                scope.yearFormatted = moment().format('YYYY');

                Clubs.getMyClub().$promise
                    .then(function (result) {
                        scope.club = result;
                        if (scope.club.HomebaseId) {
                            Locations.getLocationDetails({id: scope.club.HomebaseId}).$promise
                                .then(function (result) {
                                    scope.home = result;
                                });
                        }
                    })
                    .catch(_.partial(MessageManager.raiseError, 'load', 'club'));
                scope.user = AuthService.getUser();
            }
        };
    }
}