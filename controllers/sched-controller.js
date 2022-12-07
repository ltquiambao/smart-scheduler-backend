const logger = require("../utils/logger")("SchedController");
const { google } = require("googleapis");

const { StatusCodes } = require("http-status-codes");
const { DateTime, Duration } = require("luxon");
const GoogleApiClient = require("./google-api-client");
const { oauth2Client } = require("./auth-controller");
const Scheduler = require("./Scheduler.js");
const { BadRequestError, UnAuthenticatedError } = require("../errors/index.js");

const getSchedule = async (req, res) => {
  logger.info("[getSchedule] schedule data request started");
  const now = DateTime.now();
  const minusOneMonth = DateTime.now().minus({ month: 1 });
  const plusOneMonth = DateTime.now().plus({ month: 1 });
  try {
    const googleClient = new GoogleApiClient(oauth2Client);
    const mappedEvents = await googleClient.listEventsBetweenDateTimes(
      minusOneMonth.toISO(),
      plusOneMonth.toISO(),
      (e) => ({
        Id: e?.id,
        Subject: e?.summary,
        Location: null,
        StartTime: e?.start?.dateTime,
        EndTime: e?.end?.dateTime,
        CategoryColor: "#1aaa55",
      })
    );
    logger.debug(mappedEvents[0]);
    logger.info("[getSchedule] schedule data request successful");
    res.status(StatusCodes.OK).json(mappedEvents);
  } catch (err) {
    logger.debug(err);
    logger.error("[getSchedule] schedule data request failed");
    throw new UnAuthenticatedError("Schedule data request failed");
  }
};

// const scheduleEvent = async (origEvent, client) => {
//   const scheduler = new Scheduler(origEvent, client);
//   scheduler.buildAllTimeslots();
//   logger.debug(scheduler.availableTimeslots);
//   await scheduler.buildEventTimeslots();
//   logger.debug(scheduler.eventTimeslots);
//   scheduler.buildAvailableTimeslots();
//   logger.debug(scheduler.availableTimeslots);
//   scheduler.splitEvent();
//   logger.debug(scheduler.newEventTimeslots);
//   scheduler.setEventTimeslots();
//   logger.debug(scheduler.newEventTimeslots);
//   logger.debug(scheduler.availableTimeslots);
//   scheduler.buildNewEvents();
//   logger.debug(scheduler.newEvents);
//   return scheduler.newEvents;
// };

const createEvent = async (req, res) => {
  logger.info("[createEvent] create a new event request started");
  const origEvent = req.body;
  if (!origEvent) {
    logger.error("[createEvent] create a new event request failed");
    throw new BadRequestError("Please provide event object");
  }
  const validationResponse = await Scheduler.validate(origEvent);
  if (validationResponse.error) {
    logger.error("[createEvent] create a new event request failed");
    throw new BadRequestError(
      `Please provide required fields: ${validationResponse.error}`
    );
  }

  const scheduler = new Scheduler(validationResponse.data, {
    type: "google",
    oauth2Client,
  });
  const events = await scheduler.scheduleEvent();

  // const events = await scheduleEvent(validationResponse.data, {
  //   type: "google",
  //   oauth2Client,
  // });
  const googleClient = new GoogleApiClient(oauth2Client);
  await googleClient.insertEvents(events);
  logger.info("[createEvent] new event created");
  res.status(StatusCodes.CREATED).json({ message: "event created" });
};

module.exports = {
  getSchedule,
  createEvent,
};
