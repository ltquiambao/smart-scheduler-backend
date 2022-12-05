const { google } = require("googleapis");

const { StatusCodes } = require("http-status-codes");
const { DateTime, Duration } = require("luxon");
const GoogleApiClient = require("./google-api-controller");
const { oauth2Client } = require("./auth-controller");
const Scheduler = require("./Scheduler.js");

const getSchedule = async (req, res) => {
  console.log("[getSchedule] schedule data requested");
  //
  const now = DateTime.now();
  const minusOneMonth = DateTime.now().minus({ month: 1 });
  const plusOneMonth = DateTime.now().plus({ month: 1 });
  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: minusOneMonth.toISO(),
      timeMax: plusOneMonth.toISO(),
      singleEvents: true,
      orderBy: "startTime",
    });
    const events = response.data.items;
    console.log(`[getSchedule] schedule data received: ${events.length}`);
    const mappedEvents = events.map((event, i) => {
      // const start = event.start.dateTime || event.start.date;
      return {
        Id: event?.id,
        Subject: event?.summary,
        Location: null,
        StartTime: event?.start?.dateTime,
        EndTime: event?.end?.dateTime,
        CategoryColor: "#1aaa55",
      };
    });
    res.json(mappedEvents);
    console.log("[getSchedule] schedule data received");
  } catch (err) {
    // throw new UnAuthenticatedError(err.message);
    console.error(`[getSchedule] ${err.message}`);
  }

  // const scheduleData = [
  //   {
  //     Id: 1,
  //     Subject: "Explosion of Betelgeuse Star",
  //     Location: "Space Center USA",
  //     StartTime: "2022-11-15T04:00:00.000Z",
  //     EndTime: "2022-11-15T05:30:00.000Z",
  //     CategoryColor: "#1aaa55",
  //   },
  //   {
  //     Id: 2,
  //     Subject: "Thule Air Crash Report",
  //     Location: "Newyork City",
  //     StartTime: "2022-11-16T06:30:00.000Z",
  //     EndTime: "2022-11-16T08:30:00.000Z",
  //     CategoryColor: "#357cd2",
  //   },
  // ];
  // res.json(scheduleData);
};

const getGoogleEvents = async (req, res) => {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = response.data.items;
  if (!events || events.length === 0) {
    console.log("No upcoming events found.");
    return;
  }
  console.log("Upcoming 10 events:");
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(event);
  });
  res.json(events);
};

const tempDatetimeBuilder = (date, time) => {
  return DateTime.fromISO(`${date}T${time}:00`).toISO();
};

const buildGoogleEvent = (event) => {
  const googleEvent = {};
  googleEvent.summary = event.taskName;
  googleEvent.description = `${event.taskName} description`;
  googleEvent.start = {
    dateTime: tempDatetimeBuilder(event.startDate, event.startTime),
    timeZone: "America/Toronto",
  };
  googleEvent.end = {
    dateTime: tempDatetimeBuilder(event.deadlineDate, event.deadlineTime),
    timeZone: "America/Toronto",
  };
  googleEvent.extendedProperties = {
    private: {
      priority: event.priority,
      allowSplit: event.allowSplit,
      estimatedDuration: event.estimatedDuration,
      splitDuration: event.splitDuration,
    },
  };
  return JSON.stringify(googleEvent);
};

const splitEvent = (event) => {
  const splittedEvent = [];
  // convert to durations
  const estimatedDuration = Duration.fromObject(
    JSON.parse(event.estimatedDuration)
  );
  const splitDuration = Duration.fromObject(JSON.parse(event.splitDuration));
  // get how many splits we need
  // convert the durations to minutes
  const estimateDur = estimatedDuration.as("minutes");
  const splitDur = splitDuration.as("minutes");
  // divide estimate to split
  // NOTE we are rounding up or down for now to make things easier
  const eventCount = Math.round(estimateDur / splitDur);
  // create the list of events
  for (let i = 0; i < eventCount; i++) {
    let eventClone = JSON.parse(JSON.stringify(event));
    splittedEvent.push(eventClone);
  }
  return splittedEvent;
};

const scheduleEvent = async (origEvent, client) => {
  const scheduler = new Scheduler(origEvent, client);
  scheduler.buildAllTimeslots();
  console.log();
  console.log(scheduler.availableTimeslots);
  await scheduler.buildEventTimeslots();
  console.log(scheduler.eventTimeslots);
  scheduler.buildAvailableTimeslots();
  console.log(scheduler.availableTimeslots);
  scheduler.splitEvent();
  console.log(scheduler.newEventTimeslots);
  scheduler.setEventTimeslots();
  console.log(scheduler.newEventTimeslots);
  console.log(scheduler.availableTimeslots);
  scheduler.buildNewEvents();
  console.log(scheduler.newEvents);
  return scheduler.newEvents;
};

const createEvent = async (req, res) => {
  console.log("[createEvent] create a new event requested");
  // logic here
  // console.log(req.body);
  const origEvent = req.body;
  const events = await scheduleEvent(origEvent, {
    type: "google",
    oauth2Client,
  });
  const googleClient = new GoogleApiClient(oauth2Client);
  await googleClient.insertEvents(events);
  console.log("[createEvent] new event created");
  res.status(StatusCodes.CREATED).json({ message: "event created" });
};

const automateSchedule = (req, res) => {
  console.log("[automateSchedule] automate schedule data requested")[
    // Schedule data
    ({
      // This task was created at 2022-11-19 at 9AM
      Id: 234,
      Subject: "Develop task API",
      Location: "Newyork City",
      StartTime: "2022-11-19T09:00.000Z",
      EndTime: "2022-11-19T09:45:00.000Z",
      Deadline: "2022-11-19T012:30:00.000Z", // Urgency
      Importance: "Medium", // Importance
      TotalDuration: "1hr",
      TotalDurationWithBreak: "1hr30min",
    },
    {
      // This task was created at 2022-11-19 at 9AM
      Id: 235,
      Subject: "Develop task API",
      Location: "Newyork City",
      StartTime: "2022-11-19T09:45.000Z",
      EndTime: "2022-11-19T10:30:00.000Z",
      Deadline: "2022-11-19T012:30:00.000Z", // Urgency
      Importance: "Medium", // Importance
      TotalDuration: "1hr",
      TotalDurationWithBreak: "1hr30min",
    })
  ];

  // create a new event at 2022-11-19 at 9AM
  // front-end component sends a request with event details as its body
  // POST https://backend.com/api/v1/schedule/automate
  newE = {
    Id: 123,
    Subject: "Develop task component",
    Location: "Newyork City",
    StartTime: "",
    EndTime: "",
    ExtendedProperties: {
      Deadline: "2022-11-19T12:00:00.000Z", // Urgency
      Importance: "Medium", // Importance
      TotalDuration: "2hr", // 1000 * 60 * 120
      TotalDurationWithBreak: "3hr", // // 1000 * 60 * 180
    },
  };

  // What do we need?
  // // Step 1: Check event if it's in between the working hours
  // if (deadline < workSchedule.start || deadline > workSchedule.end ) throw Error.Invalid
  // Step 2: Check other events between startime/today and Deadline
  getEvents(starttime, deadline);
  // returns an array of events
  eventsList = [
    {
      // This event was created at 2022-11-19 at 9AM
      Id: 234,
      Subject: "Develop task API",
      Location: "Newyork City",
      StartTime: "2022-11-19T09:00.000Z",
      EndTime: "2022-11-19T09:45:00.000Z",
      ExtendedProperties: {
        Deadline: "2022-11-19T012:30:00.000Z", // Urgency
        Importance: "Medium", // Importance
        Duration: "45min", // 1000 * 60 * 45
        TotalDuration: "1hr", // 1000 * 60 * 60
        TotalDurationWithBreak: "1hr30min", // 1000 * 60 * 90
      },
    },
    {
      // This event was created at 2022-11-19 at 9AM
      Id: 235,
      Subject: "Develop task API",
      Location: "Newyork City",
      StartTime: "2022-11-19T09:45.000Z",
      EndTime: "2022-11-19T10:30:00.000Z",
      ExtendedProperties: {
        Deadline: "2022-11-19T12:30:00.000Z", // Urgency
        Importance: "Medium", // Importance
        Duration: "45min", // 1000 * 60 * 45
        TotalDuration: "1hr", // 1000 * 60 * 60
        TotalDurationWithBreak: "1hr30min", // 1000 * 60 * 90
      },
    },
  ];

  // Step 3: Create a list of available time from today/starttime until deadline
  const availableTime = {
    0: {
      StartTime: "2022-11-19T08:00:00.000Z",
      EndTime: "2022-11-19T12:30:00.000Z",
      Duration: "4hr30min", // EndTime - StartTime -> new Date('2022-11-19T12:30:00.000Z') - new Date("2022-11-19T08:00:00.000Z") = 16200000
    },
  };
  // Iterate through the events and modify available time
  for (e in eventsList) {
    if (e.StartTime > availableTime[availableTime.length - 1].startTime) {
      availableTime[0] = {
        StartTime: availableTime.startTime,
        EndTime: e.StartTime,
        Duration: "xx",
      };
      availableTime[1] = {
        StartTime: e.EndTime,
        EndTime: availableTime.EndTime,
        Duration: "xx",
      };
    }
  }

  // list of available timeslots

  //   // convert TotalDurationWithBreak to milliseconds
  //   convertDurationToMs(TotalDurationWithBreak); // 1hr30min = 1000 * 60 * 90 in milliseconds
  // Step 3: Break up the new event into 45 min increments
  const newEventSplit = [
    {
      Id: 123,
      Subject: "Develop task component",
      Location: "Newyork City",
      StartTime: "2022-11-19T08:00:00.000Z", // Default 8AM of the day
      EndTime: "2022-11-19T09:00:00.000Z", // + 45min
      ExtendedProperties: {
        Deadline: "2022-11-19T12:00:00.000Z", // Urgency
        Importance: "Medium", // Importance
        Duration: "1hr",
        TotalDuration: "2hr", // 1000 * 60 * 120
        TotalDurationWithBreak: "3hr", // // 1000 * 60 * 180
      },
    },
    {
      Id: 123,
      Subject: "Develop task component",
      Location: "Newyork City",
      StartTime: "",
      EndTime: "",
      ExtendedProperties: {
        Deadline: "2022-11-19T12:00:00.000Z", // Urgency
        Importance: "Medium", // Importance
        Duration: "45min",
        TotalDuration: "2hr", // 1000 * 60 * 120
        TotalDurationWithBreak: "3hr", // // 1000 * 60 * 180
      },
    },
    {
      Id: 123,
      Subject: "Develop task component",
      Location: "Newyork City",
      StartTime: "",
      EndTime: "",
      ExtendedProperties: {
        Deadline: "2022-11-19T12:00:00.000Z", // Urgency
        Importance: "Medium", // Importance
        Duration: "45min",
        TotalDuration: "2hr", // 1000 * 60 * 120
        TotalDurationWithBreak: "3hr", // // 1000 * 60 * 180
      },
    },
    {
      Id: 123,
      Subject: "Develop task component",
      Location: "Newyork City",
      StartTime: "",
      EndTime: "",
      ExtendedProperties: {
        Deadline: "2022-11-19T12:00:00.000Z", // Urgency
        Importance: "Medium", // Importance
        Duration: "45min",
        TotalDuration: "2hr", // 1000 * 60 * 120
        TotalDurationWithBreak: "3hr", // // 1000 * 60 * 180
      },
    },
  ];

  // Step 4: Iterate through the events and compare Importance and Deadline
  for (e in events) {
    // if new event is more important and is more urgent
    if (newE.Importance > e.Importance && newE.Deadline < e.Deadline) {
      // if there's free timeslot, book it
      // if there's no available timeslot
      //        if we can move the existing event and there's an available timeslot before deadline (prompt the user and move)
      //        if we cannot move the existing event and there's no available timeslot before deadline (prompt the user)
    }
    // if new event is more important but is not as urgent
    if (newE.Importance > e.Importance && newE.Deadline > e.Deadline) {
      // if there's free timeslot, book it
      // if there's no available timeslot
      //        if we can move the existing event and there's an available timeslot before deadline (prompt the user and move)
      //        if we cannot move the existing event and there's no available timeslot before deadline (prompt the user)
    }
    // if new event is less important but is urgent
    if (newE.Importance < e.Importance && newE.Deadline < e.Deadline) {
      // if there's free timeslot, book it
      // if there's no available timeslot
      //        don't move the existing event and ask if this is actually needed (prompt the user)
    }
    // if new event is less important and is not urgent
    if (newE.Importance < e.Importance && newE.Deadline > e.Deadline) {
      // if there's free timeslot, book it
      // if there's no available timeslot
      //        don't move the existing event and ask if this is actually needed (prompt the user)
    }
  }

  console.log("[automateSchedule] automate schedule data sent");
};

module.exports = {
  getSchedule,
  automateSchedule,
  createEvent,
  getGoogleEvents,
};
