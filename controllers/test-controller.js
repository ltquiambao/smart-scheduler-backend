const crypto = require("crypto");
const { DateTime, Interval } = require("luxon");

const eventsList = [
  {
    // This event was created at 2022-11-19 at 9AM
    Id: 234,
    Subject: "Develop task API",
    Location: "Newyork City",
    StartTime: "2022-11-19T09:00:00.000Z",
    EndTime: "2022-11-19T09:45:00.000Z",
    ExtendedProperties: {
      Deadline: "2022-11-19T012:30:00.000Z", // Urgency
      Importance: "Medium", // Importance
      SplitDuration: { minute: 45 }, // 1000 * 60 * 45
      TotalDuration: { hour: 1 }, // 1000 * 60 * 60
      TotalDurationWithBreak: { hour: 1, minute: 45 }, // 1000 * 60 * 90
    },
  },
  {
    // This event was created at 2022-11-19 at 9AM
    Id: 235,
    Subject: "Develop task API",
    Location: "Newyork City",
    StartTime: "2022-11-19T11:15:00.000Z",
    EndTime: "2022-11-19T12:00:00.000Z",
    ExtendedProperties: {
      Deadline: "2022-11-19T12:30:00.000Z", // Urgency
      Importance: "Medium", // Importance
      SplitDuration: { minute: 45 }, // 1000 * 60 * 45
      TotalDuration: { hour: 1 }, // 1000 * 60 * 60
      TotalDurationWithBreak: { hour: 1, minute: 45 }, // 1000 * 60 * 90
    },
  },
];

// Step 3: Create a list of available time from today/starttime until deadline
// const availableTime = {
//   0: {
//     StartTime: "2022-11-19T08:00:00.000Z",
//     EndTime: "2022-11-19T12:30:00.000Z",
//     Duration: "4hr30min", // EndTime - StartTime -> new Date('2022-11-19T12:30:00.000Z') - new Date("2022-11-19T08:00:00.000Z") = 16200000
//   },
// };
// console.log("before");
// console.log(availableTime);

// Iterate through the events and modify available time

const newAvailableTime = [
  {
    StartTime: "2022-11-19T08:00:00.000Z",
    EndTime: "2022-11-19T12:30:00.000Z",
    // Duration: "4hr30min", // EndTime - StartTime -> new Date('2022-11-19T12:30:00.000Z') - new Date("2022-11-19T08:00:00.000Z") = 16200000
  },
];

const requestedEvent = {
  Subject: "Develop task component",
  Location: "Newyork City",
  StartTime: "",
  EndTime: "",
  ExtendedProperties: {
    Deadline: "2022-11-19T12:00:00.000Z", // Urgency
    Importance: "Medium", // Importance
    SplitDuration: { hour: 1 }, // default
    TotalDuration: "2hr", // 1000 * 60 * 120
    TotalDurationWithBreak: "3hr", // // 1000 * 60 * 180
  },
};

const newEventSplit = [
  {
    Subject: "Develop task component",
    Location: "Newyork City",
    StartTime: "",
    EndTime: "",
    ExtendedProperties: {
      Deadline: "2022-11-19T12:00:00.000Z", // Urgency
      Importance: "Medium", // Importance
      SplitDuration: { hour: 1 }, // default
      TotalDuration: { hour: 2 }, // 1000 * 60 * 120
      TotalDurationWithBreak: { hour: 3 }, // // 1000 * 60 * 180
    },
  },
  {
    Subject: "Develop task component",
    Location: "Newyork City",
    StartTime: "",
    EndTime: "",
    ExtendedProperties: {
      Deadline: "2022-11-19T12:00:00.000Z", // Urgency
      Importance: "Medium", // Importance
      SplitDuration: { hour: 1 }, // default
      TotalDuration: { hour: 2 }, // 1000 * 60 * 120
      TotalDurationWithBreak: { hour: 3 }, // // 1000 * 60 * 180
    },
  },
];

const availableTimeslots = [
  {
    StartTime: "2022-11-19T08:00:00.000Z",
    EndTime: "2022-11-19T09:00:00.000Z",
  },
  {
    StartTime: "2022-11-19T09:45:00.000Z",
    EndTime: "2022-11-19T11:45:00.000Z",
  },
  {
    StartTime: "2022-11-19T12:00:00.000Z",
    EndTime: "2022-11-19T12:30:00.000Z",
  },
];

/**
 * Converts Datetime ISO string format to DateTime object
 * @param {*} datetimeISO
 * @returns
 */
const convertISOtoDateTime = (datetimeISO) => {
  const dt = DateTime.fromISO(datetimeISO, { zone: "utc" });
  if (!dt.isValid) {
    throw new Error(
      `[convertISOtoDateTime] ${dt.invalidReason}: ${dt.invalidExplanation}`
    );
  }
  return dt;
};

/**
 * Checks if interval2 is a subset of interval1
 * @param {*} interval1
 * @param {*} interval2
 * @returns
 */
const canEventFit = (interval1, interval2) => {
  return interval1.engulfs(interval2);
};

const setSingleEvent = (availTimeslots, event) => {
  let eventSplitDuration = event.ExtendedProperties.SplitDuration;

  const eventAvailTimeslotPos = availTimeslots.findIndex((availTimeslot) => {
    let availStartTime = convertISOtoDateTime(availTimeslot.StartTime);
    let availEndTime = convertISOtoDateTime(availTimeslot.EndTime);
    let availInterval = Interval.fromDateTimes(availStartTime, availEndTime);

    let eventEndTime = availStartTime.plus(eventSplitDuration);
    let eventInterval = Interval.fromDateTimes(availStartTime, eventEndTime);

    if (canEventFit(availInterval, eventInterval)) {
      console.log(
        `[setEventTimeslots] event '${
          event.Subject
        }' can be book from ${eventInterval.start.toISO()} to ${eventInterval.end.toISO()}`
      );
      return true;
    }
    return false;
  });

  // if there is no available timeslot where the event can fit
  if (eventAvailTimeslotPos === -1) {
    throw new Error(
      `[setEventTimeslots] event '${event.Subject}' can't be book on any timeslot`
    );
  }

  const bookedStartTime = availTimeslots[eventAvailTimeslotPos].StartTime;
  const bookedEndTime = convertISOtoDateTime(bookedStartTime)
    .plus(eventSplitDuration)
    .toISO();

  return {
    availableTimeslot: availTimeslots[eventAvailTimeslotPos],
    bookedTimeslot: {
      StartTime: bookedStartTime,
      EndTime: bookedEndTime,
    },
  };
};

/**
 * Return a new array
 * Set the StartTime and EndTime properties of events
 * @param {*} availTimeslots
 * @param {*} events
 */
const setEventTimeslots = (availTimeslots, events) => {
  return events.map((event, i) => {
    const { availableTimeslot, bookedTimeslot } = setSingleEvent(
      availTimeslots,
      event
    );
    if (!bookedTimeslot) {
      console.log(`[setEventTimeslots] no available timeslot`);
      return;
    } else {
      updateAvailableTimeslots(
        availTimeslots,
        availableTimeslot,
        bookedTimeslot
      );
    }

    return {
      ...event,
      ...bookedTimeslot,
    };
  });
};

/**
 * Create events
 * @param {*} events
 */
const createEvents = async (events) => {
  try {
    const createdEvents = await Promise.all(
      events.map((e) => {
        // insert to a database or send post request to a Google API endpoint
        return new Promise((resolve, reject) => {
          resolve({
            message: "Event created",
            event: { id: crypto.randomUUID(), ...e },
          });
        });
      })
    );
    console.log(`[createEvents] created ${createdEvents.length} events`);
    console.log(createdEvents);
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Returns list of available timeslot
 * Generate available timeslots from start datetime to end datetime
 * Note: Should be sorted before returning
 * @param {*} startDateTime
 * @param {*} endDateTime
 */
const generateAvailableTimeslots = (startDateTime, endDateTime) => {
  return newAvailableTime;
};

/**
 * Fetches a list of events from start datetiem to end datetime
 * Note: Should be sorted before returning
 * @param {*} startDateTime
 * @param {*} endDateTime
 */
const getEventTimeslots = (startDateTime, endDateTime) => {
  return eventsList;
};

/**
 *
 * @param {*} eventConfig
 */
const splitNewEvent = (eventConfig) => {
  // const eventTotalDuration = eventConfig.ExtendedProperties.TotalDuration;
  // const eventSplitDuration = eventConfig.ExtendedProperties.Duration;

  return newEventSplit;
};

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
const filterAvailableTimeslots = (availTimeslots, eventTimeslots) => {
  const availTimeslotsCopy = JSON.parse(JSON.stringify(availTimeslots));
  eventTimeslots.forEach((eventTimeslot) => {
    const eventStartTime = convertISOtoDateTime(eventTimeslot.StartTime);
    const eventEndTime = convertISOtoDateTime(eventTimeslot.EndTime);

    // shallow copy of the array
    const tempAvailTimeslots = [...availTimeslotsCopy];
    tempAvailTimeslots.forEach((availTimeslot, i) => {
      const availStartTime = convertISOtoDateTime(availTimeslot.StartTime);
      const availEndTime = convertISOtoDateTime(availTimeslot.EndTime);

      if (eventStartTime > availStartTime && eventStartTime < availEndTime) {
        availTimeslotsCopy.splice(i, 1);
        availTimeslotsCopy.push({
          StartTime: availStartTime.toString(),
          EndTime: eventStartTime.toString(),
        });
        if (eventEndTime < availEndTime) {
          availTimeslotsCopy.push({
            StartTime: eventEndTime.toString(),
            EndTime: availEndTime.toString(),
          });
        }
      } else if (eventStartTime <= availStartTime) {
        if (eventEndTime > availStartTime && eventEndTime < availEndTime) {
          availTimeslotsCopy.splice(i, 1);
          availTimeslotsCopy.push({
            StartTime: eventEndTime.toString(),
            EndTime: availEndTime.toString(),
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
};

/**
 * Update available timeslots by removing the chosen timeslot
 * @param {*} availTimeslots
 * @param {*} timeslot
 */
const updateAvailableTimeslots = (
  availTimeslots,
  availTimeslot,
  bookedTimeslot
) => {
  const timeslotPos = availTimeslots.findIndex((ts) => {
    return (
      ts.StartTime === availTimeslot.StartTime &&
      ts.EndTime === availTimeslot.EndTime
    );
  });
  const newAvailTimeslot = filterAvailableTimeslots(
    [availTimeslot],
    [bookedTimeslot]
  );
  if (newAvailTimeslot.length <= 0) {
    availTimeslots.splice(timeslotPos, 1);
  } else {
    availTimeslots[timeslotPos] = newAvailTimeslot.pop();
  }
};

const addTimeslotDuration = (timeslots) => {
  if (!Array.isArray(timeslots)) {
    console.error(`[addTimeslotDuration] timeslots is not an array`);
  }
  return timeslots.map((ts) => {
    let start = convertISOtoDateTime(ts.StartTime);
    let end = convertISOtoDateTime(ts.EndTime);
    const diff = end.diff(start, ["hours", "minutes"]);
    return { ...ts, duration: diff.toObject() };
  });
};

const getNextMinute = () => {};

// const start = convertISOtoDateTime("2022-11-19T08:00:00.000Z");
// const end = convertISOtoDateTime("2022-11-19T22:00:00.000Z");

// const diff = end.diff(start, ["hours", "minutes"]);
// console.log(diff.toObject());

const TotalAvailableTimeslots = generateAvailableTimeslots();
const FetchedEvents = getEventTimeslots();
const ActualAvailableTimeslots = filterAvailableTimeslots(
  TotalAvailableTimeslots,
  FetchedEvents
);
console.log("Actual Available Timeslots");
console.log(ActualAvailableTimeslots);

// const NewEvent = prepNewEvent();
const NewEventSplit = splitNewEvent();
try {
  const NewEventSplitTimeslots = setEventTimeslots(
    ActualAvailableTimeslots,
    newEventSplit
  );

  console.log("New Event Timeslots");
  console.log(NewEventSplitTimeslots);

  createEvents(NewEventSplitTimeslots);
} catch (err) {
  console.log(err.message);
  console.log(
    "You can choose to change the deadline of the task, or do it earlier, or hold the task for now"
  );
  console.log(
    "You can also move some events you have, here are some of the events"
  );
  console.log("Here are the conflicting events that you can adjust");
  console.log(FetchedEvents.slice(0, 3));
}

// console.log(
//   filterAvailableTimeslots(
//     [
//       {
//         StartTime: "2022-11-19T08:00:00.000Z",
//         EndTime: "2022-11-19T09:00:00.000Z",
//       },
//     ],
//     [
//       {
//         StartTime: "2022-11-19T08:00:00.000Z",
//         EndTime: "2022-11-19T09:00:00.000Z",
//       },
//     ]
//   )
// );

console.log("Actual Available Timeslots");
console.log(ActualAvailableTimeslots);

module.exports = { filterAvailableTimeslots, addTimeslotDuration };
