import moment from "moment";
import TimeService from "./TimeService";

const DEFAULT_FORMAT = "HH:mm";

export class TimerSet {

    constructor(name, startEndFormat, durationFormat) {
        this.name = name;
        this.setStartEndFormat(startEndFormat);
        this.setDurationFormat(durationFormat || startEndFormat);
        this.TimeService = new TimeService();
    }

    setStartEndFormat(startEndFormat) {
        this.startEndFormat = startEndFormat || DEFAULT_FORMAT;
    }

    setDurationFormat(durationFormat) {
        this.durationFormat = durationFormat || DEFAULT_FORMAT;
    }

    setStart(start) {
        if (moment.isMoment(start)) {
            this.start = moment(start);
        } else if (this.startEndFormat === DEFAULT_FORMAT) {
            this.start = moment.utc(start, this.startEndFormat);
        } else {
            this.start = moment.utc(this.TimeService.longDurationFormatToSeconds(start, this.durationFormat) * 1000);
        }
        this.calcDuration();
    }

    setStartSeconds(startSeconds) {
        this.start = moment.utc(startSeconds * 1000);
        this.calcDuration();
    }

    startFormatted() {
        if (this.start !== undefined) {
            if (this.durationFormat === DEFAULT_FORMAT) {
                return this.start.format(DEFAULT_FORMAT);
            } else {
                return this.TimeService.formatSecondsToLongHoursFormat(this.start.valueOf() / 1000, this.durationFormat);
            }
        }
    }

    startMoment() {
        return this.start;
    }

    endFormatted() {
        if (this.end !== undefined) {
            if (this.durationFormat === DEFAULT_FORMAT) {
                return this.end.format(DEFAULT_FORMAT);
            } else {
                return this.TimeService.formatSecondsToLongHoursFormat(this.end.valueOf() / 1000, this.durationFormat);
            }
        }
    }

    endMoment() {
        return this.end;
    }

    setEnd(end) {
        if (moment.isMoment(end)) {
            this.end = moment(end);
        } else if (this.startEndFormat === DEFAULT_FORMAT) {
            this.end = moment.utc(end, this.startEndFormat);
        } else {
            this.start = moment.utc(this.TimeService.longDurationFormatToSeconds(end, this.durationFormat) * 1000);
        }
        this.calcDuration();
    }

    setEndSeconds(endSeconds) {
        this.end = moment.utc(endSeconds * 1000);
        this.calcDuration();
    }

    setDuration(duration) {
        if(this.durationFormat === DEFAULT_FORMAT) {
            this.durationSeconds = moment.duration(duration, this.durationFormat).asSeconds();
        } else {
            this.durationSeconds = this.TimeService.longDurationFormatToSeconds(duration, this.durationFormat);
        }
        console.log("duration", duration);
        console.log("this.durationSeconds", this.durationSeconds);
        this.calcEnd();
    }

    setDurationSeconds(durationSeconds) {
        this.durationSeconds = durationSeconds;
        this.calcEnd();
    }

    durationFormatted() {
        if (this.durationSeconds !== undefined) {
            if (this.durationFormat === DEFAULT_FORMAT) {
                return moment.utc(this.durationSeconds * 1000).format(this.durationFormat);
            } else {
                return this.TimeService.formatSecondsToLongHoursFormat(this.durationSeconds, this.durationFormat);
            }
        }
    }

    calcDuration() {
        if (this.start !== undefined && this.end !== undefined) {
            this.durationSeconds = moment.duration(this.end.diff(this.start)).asSeconds();
        } else {
            this.durationSeconds = undefined;
        }
        console.log("calcDuration", this.toString());
    }

    calcEnd() {
        if (this.start !== undefined && this.durationSeconds !== undefined) {
            this.end = moment(this.start).add(this.durationSeconds, "seconds");
        }
        console.log("calcEnd", this.toString());
    }

    toString() {
        return "{TimerSet: [ name='" + this.name
            + "', start='" + this.startFormatted()
            + "', end='" + this.endFormatted()
            + "', duration='" + this.durationFormatted()
            + "' ]}";
    }

}