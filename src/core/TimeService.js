import moment from 'moment';

export default class TimeService {

    parseLongHoursString(formatted) {
        if (!formatted) {
            return {hours: 0, minutes: 0};
        }
        var colonPosition = formatted.indexOf(":");
        let hours = parseInt(formatted.substring(0, colonPosition));
        let minutes = parseInt(formatted.substring(colonPosition + 1, formatted.length));
        return {hours: hours, minutes: minutes};
    }

    calcLongDuration(begin, end) {
        var endMinutes = this.longDurationFormatToMinutes(end);
        var beginMinutes = this.longDurationFormatToMinutes(begin);

        let minutes = endMinutes - beginMinutes;
        if (minutes < 0) {
            return '';
        }

        return this.formatMinutesToLongHoursFormat(minutes);
    }

    formatMinutesToLongHoursFormat(minutes, format1) {
        let format = format1 || "min";
        if (minutes) {
            if (format === "min") {
                let resultHours = Math.floor(minutes / 60);
                minutes = minutes - (resultHours * 60);

                return resultHours + ":" + String("0" + minutes).slice(-2);
            } else if (format === "100min") {
                let resultHours = Math.floor(minutes / 100);
                let centi = minutes - (resultHours * 60);

                return resultHours + "." + String("0" + centi).slice(-2);
            }
        }
    }

    engineCounterFormatString(counterUnitTypeKey) {
        console.log("counterUnitTypeKey", counterUnitTypeKey);
        switch(counterUnitTypeKey) {
            case "min":
                return "hhhh:mm";
                break;
            case "100min":
                return "hhhh.mm";
                break;
            default:
                return "?";
        }
    }

    longDurationFormatToMinutes(longMoment) {
        let parsed = this.parseLongHoursString(longMoment);
        return (parsed.hours * 60) + parsed.minutes;
    }

    time(dateObject) {
        return dateObject && moment(dateObject).format('HH:mm');
    }

    date(dateObject) {
        return dateObject && moment(dateObject).format('DD.MM.YYYY');
    }

    parseDateTime(dateString, timeString) {
        return dateString && timeString && moment(dateString + ' ' + timeString, 'DD.MM.YYYY HH:mm').toDate();
    }

    formatTime(time) {
        if (time === undefined) {
            return;
        }
        if (time.length === 3) {
            time = '0' + time;
        }
        if (time.length > 2 && time.indexOf(':') === -1) {
            return time.substring(0, time.length - 2) + ':' + time.substring(time.length - 2);
        } else if (time.length <= 1) {
            return '00:0' + time
        } else if (time.length <= 2) {
            return '00:' + time
        }
        return time;
    }

    removeTimeOffset(d) {
        if (!d) {
            return;
        }
        return moment(d).utc().hours(0).minutes(0).seconds(0).local().toDate();
    }

}