const { google } = require("googleapis");
// const { oauth2Client } = require("./auth-controller");
const { delay } = require("../util/util");

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
    mappingFn = (e) => e
  ) {
    console.log("[googleAPI][listEvents] events list requested");
    try {
      const response = await this._calendar.events.list({
        calendarId: this._calendarId,
        timeMin: startDateTimeISO,
        timeMax: endDateTimeISO,
        // maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });
      const events = response.data.items;
      const mappedEvents = events.map((event, i) => {
        return mappingFn(event);
      });
      console.log(
        `[googleAPI][listEvents] events list received count: ${mappedEvents.length}`
      );
      return mappedEvents;
    } catch (err) {
      throw new Error(
        `[googleAPI][listEvents] There was an error contacting the Calendar service: ${err}`
      );
    }
  }

  async insertEvent(event) {
    console.log("[googleAPI][insertEvent] event insert requested");
    try {
      const response = await this._calendar.events.insert({
        calendarId: this._calendarId,
        resource: event,
      });
      // console.log(response);
      console.log(
        `[googleAPI][insertEvent] Event created: ${response.data.htmlLink}`
      );
      return response.data.htmlLink;
    } catch (err) {
      throw new Error(
        `[googleAPI][insertEvent] There was an error contacting the Calendar service: ${err}`
      );
    }
  }

  async insertEvents(events) {
    console.log("[googleAPI][insertEvents] events insert requested");

    try {
      let insertedEvents = [];
      for (let event of events) {
        delay(1000);
        const res = await this.insertEvent(event);
        insertedEvents.push(res);
      }
      console.log(
        `[googleAPI][insertEvents] events inserted: ${insertedEvents.length}`
      );
      console.log(insertedEvents);
      return insertedEvents;
    } catch (err) {
      throw new Error(
        `[googleAPI][insertEvents] events inserting failed: ${err}`
      );
    }

    // try {
    //   const insertedEvents = await Promise.all(
    //     events.map(async (e) => {
    //       await delay(1000);
    //       return this.insertEvent(e);
    //     })
    //   );
    //   console.log(
    //     `[googleAPI][insertEvents] events inserted: ${insertedEvents.length}`
    //   );
    //   console.log(insertedEvents);
    //   return insertedEvents;
    // } catch (err) {
    //   throw new Error(
    //     `[googleAPI][insertEvents] events inserting failed: ${err}`
    //   );
    // }
  }
}

module.exports = GoogleApiClient;
