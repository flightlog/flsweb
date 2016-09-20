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
        var endSeconds = this.longDurationFormatToSeconds(end);
        var beginSeconds = this.longDurationFormatToSeconds(begin);

        let seconds = endSeconds - beginSeconds;
        if (seconds < 0) {
            return '';
        }

        return this.formatSecondsToLongHoursFormat(seconds);
    }

    formatSecondsToLongHoursFormat(totalSeconds, format1) {
        let format = format1 || "min";
        if (totalSeconds) {
            let hours = Math.floor(totalSeconds / 3600);
            if (format === "min") {
                let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);

                return hours + ":" + String("0" + minutes).slice(-2);
            } else if (format === "2decimalsperhour") {
                return "" + (Math.floor(totalSeconds / 36) / 100).toFixed(2);
            } else {
                return totalSeconds;
            }
        }
    }

    engineCounterFormatString(counterUnitTypeKey) {
        switch (counterUnitTypeKey) {
            case "min":
                return "hhhh:mm";
                break;
            case "2decimalsperhour":
                return "hhhh.mm";
                break;
            default:
                console.log("unknown format: '" + counterUnitTypeKey + "' - expected 'min' or '2decimalsperhour'");
                return "?";
        }
    }

    longDurationFormatToSeconds(longMoment) {
        let parsed = this.parseLongHoursString(longMoment);
        return (parsed.hours * 3600) + parsed.minutes * 60 + parsed.seconds;
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