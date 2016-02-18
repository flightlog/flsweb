import moment from 'moment';

export default class TimeService {
    constructor() {
        return {
            time: function (dateObject) {
                return dateObject && moment(dateObject).format('HH:mm');
            },
            date: function (dateObject) {
                return dateObject && moment(dateObject).format('DD.MM.YYYY');
            },
            parseDateTime: function (dateString, timeString) {
                return dateString && timeString && moment(dateString + ' ' + timeString, 'DD.MM.YYYY HH:mm').toDate();
            }
        };
    }
}