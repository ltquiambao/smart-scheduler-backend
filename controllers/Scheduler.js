const { DateTime } = require("luxon");
const { DateHelper } = require("../helper/DateTime");
const GoogleApiClient = require("./google-api-controller");
const { oauth2Client } = require("./auth-controller");

const defaultConfig = {
  hour: {
    total: {
      start: 6,
      end: 22,
    },
    work: {
      start: 8,
      end: 17,
    },
  },
  day: {
    total: {
      start: "SUN",
      end: "SAT",
    },
    work: {
      start: "MON",
      end: "FRI",
    },
  },
  timeZone: "America/Toronto",
};

class Scheduler {
  constructor(event, client) {
    this._dateHelper = new DateHelper(event.timeZone);
    this._calendarClient = client;
    if (this._calendarClient.type === "google") {
      this._calendarClient = new GoogleApiClient(
        this._calendarClient.oauth2Client
      );
    }

    this._event = this.format(event);
    this._googleEvent = this._startDT = "";
    this._endDT = "";

    this._availTimeslots = [];
    this._eventTimeslots = [];
    this._newEventTimeslots = [];

    this._newEvents = [];

    this._availConfig = defaultConfig;
  }

  get event() {
    return this._event;
  }

  get availableTimeslots() {
    return this._availTimeslots;
  }

  get eventTimeslots() {
    return this._eventTimeslots;
  }

  get newEventTimeslots() {
    return this._newEventTimeslots;
  }

  get newEvents() {
    return this._newEvents;
  }

  get helper() {
    return {
      dateTime: this._dateHelper.dateTime,
      duration: this._dateHelper.duration,
      interval: this._dateHelper.interval,
    };
  }

  format(event) {
    const fmtEvent = { ...event };
    // convert task name to summary
    fmtEvent.summary = event.taskName;
    // convert date and time to luxon DateTime
    fmtEvent.startDT = this.helper.dateTime.fromDateAndTime(
      event.startDate,
      event.startTime
    );
    fmtEvent.endDT = this.helper.dateTime.fromDateAndTime(
      event.deadlineDate,
      event.deadlineTime
    );
    // convert luxon DateTime to DateTimeISO string
    fmtEvent.startDTISO = fmtEvent.startDT.toISO();
    fmtEvent.endDTISO = fmtEvent.endDT.toISO();
    // get start DateTime and end DateTime difference in days
    fmtEvent.diffInDaysMax = this.helper.dateTime.getDiff(
      fmtEvent.startDT,
      fmtEvent.endDT,
      "days",
      "max"
    );
    fmtEvent.diffInDaysMin = this.helper.dateTime.getDiff(
      fmtEvent.startDT,
      fmtEvent.endDT,
      "days",
      "min"
    );
    fmtEvent.diffInDays = this.helper.dateTime.getDiff(
      fmtEvent.startDT,
      fmtEvent.endDT,
      "days"
    );
    // convert duration strings to object
    fmtEvent.estimDurObj = JSON.parse(event.estimatedDuration);
    fmtEvent.splitDurObj = JSON.parse(event.splitDuration);
    // convert duration strings to luxon Durations
    fmtEvent.estimDur = this.helper.duration.fromObjectString(
      event.estimatedDuration
    );
    fmtEvent.splitDur = this.helper.duration.fromObjectString(
      event.splitDuration
    );
    return fmtEvent;
  }

  buildAllTimeslots() {
    const startDate = this._event.startDT;
    const startHour = this._availConfig.hour.total.start;
    const endHour = this._availConfig.hour.total.end;

    let nextDate = startDate;
    for (let i = 1; i <= this._event.diffInDaysMax; i++) {
      let startDT = nextDate.set({ hour: startHour });
      let endDT = nextDate.set({ hour: endHour });
      // if it's the start date compare and get the latest
      if (startDT.toISODate() === this._event.startDT.toISODate()) {
        if (startDT.hour < this._event.startDT.hour) {
          startDT = this._event.startDT;
        }
        this._startDT = startDT.toISO();
      }
      // if it's the end date compare and get the earliest
      else if (endDT.toISODate() === this._event.endDT.toISODate()) {
        if (endDT.hour > this._event.endDT.hour) {
          endDT = this._event.endDT;
        }
        this._endDT = endDT.toISO();
      }
      // add the start and end datetime's to the list
      this._availTimeslots.push({
        start: startDT.toISO(),
        end: endDT.toISO(),
      });
      nextDate = startDate.plus({ day: i });
    }
  }

  async buildEventTimeslots() {
    this._eventTimeslots =
      await this._calendarClient.listEventsBetweenDateTimes(
        this._startDT,
        this._endDT,
        (e) => ({
          Id: e?.id,
          subject: e?.summary,
          start: e?.start?.dateTime,
          end: e?.end?.dateTime,
        })
      );
  }

  /**
   * returns a new list of timeslots that does not intersect with the event timeslots.
   *
   * - if the existing event is in between the available timeslot, split the available timeslot
   * - if the existing event has a conflict on either right/left end, cut the available timeslot
   * ```
   * example:
   *    available_time: [----------------]
   *    event         :      [-----]
   *    result        : [---]       [----]
   *
   *    available_time: [----------------]
   *    event         :            [-----]
   *    result        : [---------]
   *
   *    available_time: [----------------]
   *    event         : [-----]
   *    result        :        [---------]
   *
   *    available_time:     [---------]
   *    event         : [----------------]
   *    result        :
   * ```
   */
  filterAvailableTimeslots(availTimeslots, eventTimeslots) {
    if (!availTimeslots) {
      throw new Error(
        `[Scheduler][filterAvailableTimeslots] missing available timeslots`
      );
    }
    if (!eventTimeslots) {
      throw new Error(
        `[Scheduler][filterAvailableTimeslots] missing event timeslots`
      );
    }
    const availTimeslotsCopy = JSON.parse(JSON.stringify(availTimeslots));
    eventTimeslots.forEach((eventTimeslot) => {
      const eventStartTime = this.helper.dateTime.fromISO(eventTimeslot.start);
      const eventEndTime = this.helper.dateTime.fromISO(eventTimeslot.end);

      // shallow copy of the array
      const tempAvailTimeslots = [...availTimeslotsCopy];
      tempAvailTimeslots.forEach((availTimeslot, i) => {
        const availStartTime = this.helper.dateTime.fromISO(
          availTimeslot.start
        );
        const availEndTime = this.helper.dateTime.fromISO(availTimeslot.end);

        if (eventStartTime > availStartTime && eventStartTime < availEndTime) {
          availTimeslotsCopy.splice(i, 1);
          availTimeslotsCopy.push({
            start: availStartTime.toString(),
            end: eventStartTime.toString(),
          });
          if (eventEndTime < availEndTime) {
            availTimeslotsCopy.push({
              start: eventEndTime.toString(),
              end: availEndTime.toString(),
            });
          }
        } else if (eventStartTime <= availStartTime) {
          if (eventEndTime > availStartTime && eventEndTime < availEndTime) {
            availTimeslotsCopy.splice(i, 1);
            availTimeslotsCopy.push({
              start: eventEndTime.toString(),
              end: availEndTime.toString(),
            });
          } else if (eventEndTime >= availEndTime) {
            let timeSlotIndex = availTimeslotsCopy.findIndex(
              (tS) => tS === availTimeslot
            );
            availTimeslotsCopy.splice(timeSlotIndex, 1);
          }
        }
      });
    });
    return availTimeslotsCopy;
  }

  sortTimeslots(timeslots) {
    timeslots.sort((timeslotA, timeslotB) => {
      this.helper.dateTime.fromISO(timeslotA.start) <
        this.helper.dateTime.fromISO(timeslotB.start);
    });
  }

  buildAvailableTimeslots() {
    const availTimeslots = this._availTimeslots;
    const eventTimeslots = this._eventTimeslots;
    this._availTimeslots = this.filterAvailableTimeslots(
      availTimeslots,
      eventTimeslots
    );
    this.sortTimeslots(this._availTimeslots);
  }

  splitEvent() {
    const event = this._event;
    const splittedEvent = this._newEventTimeslots;
    // convert to durations
    const estimatedDuration = event.estimDur;
    const splitDuration = event.splitDur;
    // get how many splits we need
    // convert the durations to minutes
    const estimateDur = estimatedDuration.as("minutes");
    const splitDur = splitDuration.as("minutes");
    // divide estimate to split
    // NOTE we are rounding up or down for now to make things easier
    const eventCount = Math.round(estimateDur / splitDur);
    // create the list of events
    this._newEventTimeslots = Scheduler.buildSplitEvents(
      this._event,
      eventCount
    );
    return this._newEventTimeslots;
  }

  static buildSplitEvents(event, count) {
    const splitEvents = [];
    const summary = event?.summary;
    for (let i = 0; i < count; i++) {
      let splitEvent = {
        summary,
        start: "",
        end: "",
      };
      splitEvents.push(splitEvent);
    }
    return splitEvents;
  }

  setSingleEvent(event) {
    const availTimeslots = this._availTimeslots;
    let eventSplitDuration = this.event.splitDurObj;

    const eventAvailTimeslotPos = availTimeslots.findIndex((availTimeslot) => {
      let availStartTime = this.helper.dateTime.fromISO(availTimeslot.start);
      let availEndTime = this.helper.dateTime.fromISO(availTimeslot.end);
      let availInterval = this.helper.interval.fromDateTimes(
        availStartTime,
        availEndTime
      );

      let eventEndTime = availStartTime.plus(eventSplitDuration);
      let eventInterval = this.helper.interval.fromDateTimes(
        availStartTime,
        eventEndTime
      );

      if (this.helper.interval.canIntervalFit(availInterval, eventInterval)) {
        console.log(
          `[Scheduler][setSingleEvent] event '${
            event.subject
          }' can be book from ${eventInterval.start.toISO()} to ${eventInterval.end.toISO()}`
        );
        return true;
      }
      return false;
    });

    // if there is no available timeslot where the event can fit
    if (eventAvailTimeslotPos === -1) {
      console.warn(
        `[Scheduler][setSingleEvent] event '${event.subject}' can't be book on any timeslot`
      );
      return;
    }

    const bookedStartTime = availTimeslots[eventAvailTimeslotPos].start;
    const bookedEndTime = this.helper.dateTime
      .fromISO(bookedStartTime)
      .plus(eventSplitDuration)
      .toISO();

    return {
      availableTimeslot: availTimeslots[eventAvailTimeslotPos],
      bookedTimeslot: {
        start: bookedStartTime,
        end: bookedEndTime,
      },
    };
  }

  updateAvailableTimeslots(availTimeslot, bookedTimeslot) {
    const availTimeslots = this._availTimeslots;

    const timeslotPos = availTimeslots.findIndex((ts) => {
      return (
        ts.start === availTimeslot.start && ts.start === availTimeslot.start
      );
    });
    const newAvailTimeslot = this.filterAvailableTimeslots(
      [availTimeslot],
      [bookedTimeslot]
    );
    if (newAvailTimeslot.length <= 0) {
      availTimeslots.splice(timeslotPos, 1);
    } else {
      availTimeslots[timeslotPos] = newAvailTimeslot.pop();
    }
  }

  setEventTimeslots() {
    // const availTimeslots = this._availTimeslots;
    const events = this._newEventTimeslots;
    this._newEventTimeslots = events.map((event, i) => {
      const { availableTimeslot, bookedTimeslot } = this.setSingleEvent(event);
      if (!bookedTimeslot) {
        console.warn(
          `[Scheduler][setEventTimeslots] no available timeslot for the event`
        );
        return;
      } else {
        // NOTE we need this update available timeslot because we are currently drafting
        this.updateAvailableTimeslots(availableTimeslot, bookedTimeslot);
      }

      return {
        ...event,
        ...bookedTimeslot,
      };
    });
    return this._newEventTimeslots;
  }

  buildNewEvents() {
    const eventDetails = this._event;
    const newEventTimeslots = this._newEventTimeslots;
    this._newEvents = newEventTimeslots.map((eventTimeslot) =>
      GoogleApiClient.buildGoogleEvent(eventTimeslot, eventDetails)
    );
  }
}

const testEvent = {
  deadlineDate: "2022-12-01",
  deadlineTime: "13:00",
  allowSplit: true,
  estimatedDuration: '{"hour":2}',
  splitDuration: '{"hour":1}',
  startDate: "2022-11-30",
  startTime: "15:00",
  taskName: "task",
  priority: "medium",
  timeZone: "America/Toronto", // add in frontend
};

// const sched = new Scheduler(testEvent, oauth2Client);
// console.log(sched.event);
// sched.buildAllTimeslots();
// console.log(sched.availableTimeslots);
// // sched.getEventTimeslots();
// sched.splitEvent();
// console.log(sched.newEventTimeslots);
// sched.setEventTimeslots();
// console.log(sched.newEventTimeslots);

// // console.log(sched.newEventTimeslots);
// console.log(sched.availableTimeslots);
// sched.buildNewEvents();
// console.log(sched.newEvents);
module.exports = Scheduler;
