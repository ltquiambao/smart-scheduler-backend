const { DateTime, Duration, Interval } = require("luxon");

class DateTimeHelper {
  constructor(timeZone) {
    this._timeZone = timeZone;
  }

  /**
   * It takes a string in ISO format and returns a DateTime object.
   * @param datetimeISO - The ISO string to convert to a DateTime object.
   * @param [timeZone] - The time zone to use for the DateTime object.
   * @returns A DateTime object.
   */
  fromISO(datetimeISO, timeZone = this._timeZone) {
    const dt = DateTime.fromISO(datetimeISO, { zone: timeZone });
    if (!dt.isValid) {
      throw new Error(
        `[DateTimeHelper][fromISO] ${dt.invalidReason}: ${dt.invalidExplanation}`
      );
    }
    return dt;
  }

  /**
   * It takes a date and time and returns a DateTime object.
   * @param date - "2020-01-01"
   * @param time - "12:00"
   * @param [timeZone] - The timezone to use for the DateTime object.
   * @returns A DateTime object.
   */
  fromDateAndTime(date, time, timeZone = this._timeZone) {
    const dt = DateTime.fromFormat(`${date} ${time}`, "yyyy-MM-dd HH:mm", {
      zone: timeZone,
    });
    if (!dt.isValid) {
      throw new Error(
        `[DateTimeHelper][fromDateAndTime] ${dt.invalidReason}: ${dt.invalidExplanation}`
      );
    }
    return dt;
  }

  getDiff(start, end, unit, minMax = null) {
    const validMinMax = [null, "min", "max"];
    let diff = end.diff(start, unit).toObject();
    if (unit === "days") {
      diff = diff.days;
      if (!validMinMax.includes(minMax)) {
        throw new Error(
          `[DateTimeHelper][getDiff] Invalid minMax argument: ${minMax}`
        );
      } else if (minMax === "min") {
        diff = Math.ceil(diff);
      } else if (minMax === "max") {
        diff = Math.ceil(diff) + 1;
      }
    }

    return diff;
  }
}

class DurationHelper {
  /**
   * It takes a stringified version of a Duration object and returns a Duration object
   * @param duration - The duration string to be parsed.
   * @returns A duration object.
   */
  fromObjectString(duration) {
    const dur = Duration.fromObject(JSON.parse(duration));
    if (!dur.isValid) {
      throw new Error(
        `[DurationHelper][fromObjectString] ${dur.invalidReason}: ${dur.invalidExplanation}`
      );
    }

    return dur;
  }
}

class IntervalHelper {
  /**
   * It takes two DateTime objects and returns an Interval object.
   * @param startDT - Start DateTime
   * @param endDT - End DateTime
   * @returns An interval object.
   */
  fromDateTimes(startDT, endDT) {
    const interval = Interval.fromDateTimes(startDT, endDT);
    if (!interval.isValid) {
      throw new Error(
        `[IntervalHelper][fromDateTimes] ${interval.invalidReason}: ${interval.invalidExplanation}`
      );
    }

    return interval;
  }
  /**
   * If the first interval engulfs the second interval, return true, otherwise return false.
   * @param interval1 - The first interval to check.
   * @param interval2 - The interval to be checked for fitting into interval1.
   * @returns a boolean value.
   */
  canIntervalFit(interval1, interval2) {
    return interval1.engulfs(interval2);
  }
}

class DateHelper {
  constructor(timeZone) {
    this._dateTime = new DateTimeHelper(timeZone);
    this._duration = new DurationHelper();
    this._interval = new IntervalHelper();
  }

  get dateTime() {
    return this._dateTime;
  }
  get duration() {
    return this._duration;
  }
  get interval() {
    return this._interval;
  }
}

module.exports = { DateHelper };
