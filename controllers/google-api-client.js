const logger = require("../utils/logger")("GoogleApiClient");
const { google } = require("googleapis");

// const { oauth2Client } = require("./auth-controller");
const { delay } = require("../utils/util");

class GoogleApiClient {
  constructor(oauth2Client) {
    this._oauth2Client = oauth2Client;
    this._calendar = google.calendar({ version: "v3", auth: oauth2Client });
    this._calendarId = "primary";
  }

  static buildGoogleEvent(eventTimeslot, eventDetails) {
    return JSON.stringify({
      summary: eventDetails?.summary,
      location: eventDetails?.location,
      description: eventDetails?.description,
      start: {
        dateTime: eventTimeslot?.start,
        timeZone: eventDetails?.timeZone,
      },
      end: {
        dateTime: eventTimeslot?.end,
        timeZone: eventDetails?.timeZone,
      },
      // recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
      // attendees: [
      //   { email: "lpage@example.com" },
      //   { email: "sbrin@example.com" },
      // ],
      // reminders: {
      //   useDefault: false,
      //   overrides: [
      //     { method: "email", minutes: 24 * 60 },
      //     { method: "popup", minutes: 10 },
      //   ],
      // },
    });
  }
  async listEventsBetweenDateTimes(
    startDateTimeISO,
    endDateTimeISO,
    mappingFn
  ) {
    logger.info("[listEventsBetweenDateTimes] events list request started");
    try {
      const mappedEvents = await this.listMappedEvents(
        {
          calendarId: this._calendarId,
          timeMin: startDateTimeISO,
          timeMax: endDateTimeISO,
          singleEvents: true,
          orderBy: "startTime",
        },
        mappingFn
      );

      logger.info(
        `[listEventsBetweenDateTimes] events list received count: ${mappedEvents.length}`
      );
      return mappedEvents;
    } catch (err) {
      const errMsg = `[listEventsBetweenDateTimes] events list request failed`;
      logger.error(errMsg);
      throw new Error(errMsg);
    }
  }

  async listMappedEvents(args, mappingFn = (e) => e) {
    logger.info("[listMappedEvents] events list request started");
    try {
      const response = await this._calendar.events.list(args);
      const events = response.data.items;
      const mappedEvents = events.map((event, i) => {
        return mappingFn(event);
      });
      logger.info(
        `[listMappedEvents] events list received count: ${mappedEvents.length}`
      );
      return mappedEvents;
    } catch (err) {
      const errMsg = `[listMappedEvents] There was an error contacting the Calendar service: ${err}`;
      logger.error(errMsg);
      throw new Error(errMsg);
    }
  }

  async insertEvent(event) {
    logger.info("[insertEvent] event insert request started");
    try {
      const response = await this._calendar.events.insert({
        calendarId: this._calendarId,
        resource: event,
      });
      // logger.info(response);
      logger.info(`[insertEvent] Event created: ${response.data.htmlLink}`);
      return response.data.htmlLink;
    } catch (err) {
      throw new Error(
        `[insertEvent] There was an error contacting the Calendar service: ${err}`
      );
    }
  }

  async insertEvents(events) {
    logger.info("[insertEvents] events insert request started");

    try {
      let insertedEvents = [];
      for (let event of events) {
        delay(1000);
        const res = await this.insertEvent(event);
        insertedEvents.push(res);
      }
      logger.info(`[insertEvents] events inserted: ${insertedEvents.length}`);
      logger.info(insertedEvents);
      return insertedEvents;
    } catch (err) {
      throw new Error(`[insertEvents] events insert request failed`);
    }
  }
}

module.exports = GoogleApiClient;
