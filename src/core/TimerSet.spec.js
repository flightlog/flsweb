import moment from "moment";
import {TimerSet} from "./TimerSet";

describe('TimerSet', () => {

    it('should format the duration in default format if nothing specified', () => {
        // arrange
        let timerSet = new TimerSet("test");
        timerSet.setStart(moment("01:00", "HH:mm"));
        timerSet.setEnd(moment("01:30", "HH:mm"));

        // act
        let result = timerSet.durationFormatted();

        // assert
        expect(result).toEqual('00:30');
    });

    it('should format the duration in long hours format if Min specified', () => {
        // arrange
        let timerSet = new TimerSet("test", "HH:mm", "Min");
        timerSet.setStart(moment("01 01:00", "DD HH:mm"));
        timerSet.setEnd(moment("07 01:30", "DD HH:mm"));

        // act
        let result = timerSet.durationFormatted();

        // assert
        expect(result).toEqual('144:30');
    });

    it('should format the duration in long hours decimal format if specified', () => {
        // arrange
        let timerSet = new TimerSet("test", "HH:mm", "2decimalsperhour");
        timerSet.setStart(moment("01 01:00", "DD HH:mm"));
        timerSet.setEnd(moment("07 01:30", "DD HH:mm"));

        // act
        let result = timerSet.durationFormatted();

        // assert
        expect(result).toEqual('144.50');
    });

    it('should format the duration in long hours decimal format if specified', () => {
        // arrange
        let timerSet = new TimerSet("test", "HH:mm", "2decimalsperhour");
        timerSet.setStartSeconds(100);
        timerSet.setEndSeconds(10000);

        // act
        let result = timerSet.durationFormatted();

        // assert
        expect(result).toEqual('2.75');
    });

    it('should calculate the end time if duration is updated', () => {
        // arrange
        let timerSet = new TimerSet("test");
        timerSet.setStartSeconds(100);
        timerSet.setDurationSeconds(1700);

        // act
        let result = timerSet.endFormatted();

        // assert
        expect(result).toEqual('00:30');
    });

    it('should calculate the end time if formatted duration is updated', () => {
        // arrange
        let timerSet = new TimerSet("test", "2decimalsperhour", "2decimalsperhour");
        timerSet.setStartSeconds(60);
        timerSet.setDuration("100.50");

        // act
        let result = timerSet.endFormatted();

        // assert
        expect(result).toEqual('100.51');
    });

    it('should calculate the duration if start is updated', () => {
        // arrange
        let timerSet = new TimerSet("test");
        timerSet.setStartSeconds(0);
        timerSet.setEndSeconds(3600 * 10);
        expect(timerSet.startFormatted()).toEqual('00:00');
        expect(timerSet.durationFormatted()).toEqual('10:00');

        // act
        timerSet.setStart(moment.utc("05:30", "HH:mm"));
        let result = timerSet.durationFormatted();

        // assert
        expect(result).toEqual('04:30');
    });

    it('should allow to change the format', () => {
        // arrange
        let timerSet = new TimerSet("test");
        timerSet.setStartSeconds(0);
        timerSet.setEndSeconds(3600 * 10.5);
        expect(timerSet.startFormatted()).toEqual('00:00');
        expect(timerSet.durationFormatted()).toEqual('10:30');

        // act
        timerSet.setDurationFormat("2decimalsperhour");
        let result = timerSet.durationFormatted();

        // assert
        expect(result).toEqual('10.50');
    });

    it('duration format should default to start-end format', () => {
        // arrange
        let timerSet = new TimerSet("test", "2decimalsperhour");
        timerSet.setStartSeconds(3600);
        timerSet.setEndSeconds(3600 * 10.5);
        expect(timerSet.startFormatted()).toEqual('1.00');
        expect(timerSet.endFormatted()).toEqual('10.50');

        // act
        let result = timerSet.durationFormatted();

        // assert
        expect(result).toEqual('9.50');
    });

    it('zero time should be formatted', () => {
        // arrange
        let timerSet = new TimerSet("test", "2decimalsperhour");
        timerSet.setStartSeconds(0);

        // act
        let result = timerSet.startFormatted();

        // assert
        expect(result).toEqual('0.00');
    });

    it('zero time should be formatted', () => {
        // arrange
        let timerSet = new TimerSet("test", "Min");
        timerSet.setStartSeconds(0);

        // act
        let result = timerSet.startFormatted();

        // assert
        expect(result).toEqual('0:00');
    });

});
