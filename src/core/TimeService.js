import moment from 'moment';

export default class TimeService {

    delimiterFor(format) {
        let delimiter = ":";
        if (format === "2decimalsperhour") {
            delimiter = ".";
        }

        return delimiter;
    }

    longDurationFormatToSeconds(formatted, format1) {
        let format = format1 || "Min";
        if (!formatted || formatted.trim() === "") {
            return 0;
        }

        if (format === "2decimalsperhour") {
            return parseFloat(formatted) * 3600;
        } else if (format === "Min") {
            var colonPosition = formatted.indexOf(":");
            let hours = parseInt(formatted.substring(0, colonPosition));
            let minutes = parseInt(formatted.substring(colonPosition + 1, formatted.length));

            return (hours * 3600) + (minutes * 60);
        }

    }

    formatSecondsToLongHoursFormat(totalSeconds, format1) {
        let format = format1 || "Min";
        if (totalSeconds !== undefined) {
            let hours = Math.floor(totalSeconds / 3600);
            if (format === "Min") {
                let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);

                return hours + ":" + String("0" + minutes).slice(-2);
            } else if (format === "2decimalsperhour") {
                return "" + (Math.floor(totalSeconds / 36) / 100).toFixed(2);
            } else {
                throw new Error("unsupported format: '" + format1 + "'");
            }
        }
    }

    engineCounterFormatString(counterUnitTypeKey) {
        switch (counterUnitTypeKey) {
            case "Min":
                return "hhhh:mm";
                break;
            case "2decimalsperhour":
                return "hhhh.mm";
                break;
            default:
                throw new Error("unknown format: '" + counterUnitTypeKey + "' - expected 'Min' or '2decimalsperhour'");
        }
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
        if (!time) {
            return;
        }
        if ((time.length === 3 && time.indexOf(':') === -1) || (time.length === 4 && time.indexOf(':') > -1)) {
            time = '0' + time;
        }
        if (time.length > 2 && time.indexOf(':') === -1) {
            let stringStrippedDecimal = time.replace(".", "");
            return stringStrippedDecimal.substring(0, stringStrippedDecimal.length - 2) + ':' + stringStrippedDecimal.substring(stringStrippedDecimal.length - 2);
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
