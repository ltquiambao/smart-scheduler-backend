// const { DateTime, Duration } = require("luxon");

// interface AvailabilityConfiguration {
//   hour: {
//     total: {
//       start: number;
//       end: number;
//     };
//   };
// }

// interface UnsanitizedEvent {
//   allowSplit: boolean;
//   deadlineDate: string;
//   deadlineTime: string;
//   estimatedDuration: string;
//   priority: string;
//   splitDuration: string;
//   startDate: string;
//   startTime: string;
//   taskName: string;
// }

// interface Event {
//   allowSplit: boolean;
//   deadlineDate: string;
//   deadlineTime: string;
//   estimatedDuration: {
//     hour: number;
//     minute: number;
//   };
//   priority: string;
//   splitDuration: {
//     hour: number;
//     minute: number;
//   };
//   startDate: string;
//   startTime: string;
//   taskName: string;
// }

// interface Timeslot {
//   start: typeof DateTime;
//   end: typeof DateTime;
// }

// interface Scheduler {
//   _event: Event;
//   _availConfig: AvailabilityConfiguration;
//   sanitize(): Event;
//   generateAllTimeslots(): Timeslot[];
// }

// const defaultConfig = {
//   hour: {
//     total: {
//       start: 6,
//       end: 22,
//     },
//     work: {
//       start: 8,
//       end: 17,
//     },
//   },
//   day: {
//     total: {
//       start: "SUN",
//       end: "SAT",
//     },
//     work: {
//       start: "MON",
//       end: "FRI",
//     },
//   },
//   timeZone: "America/Toronto",
// };

// class Scheduler implements Scheduler {
//   constructor(event: UnsanitizedEvent) {
//     this._event = Scheduler.sanitize(event);
//     this._availConfig = defaultConfig;
//   }
//   static sanitize(event: UnsanitizedEvent) {
//     return {
//       allowSplit: event.allowSplit,
//       deadlineDate: event.deadlineDate,
//       deadlineTime: event.deadlineTime,
//       estimatedDuration: JSON.parse(event.estimatedDuration),
//       priority: event.priority,
//       splitDuration: JSON.parse(event.splitDuration),
//       startDate: event.startDate,
//       startTime: event.startTime,
//       taskName: event.taskName,
//     };
//   }

//   private generateAllTimeslots(startDateTime: string, endDateTime: string) {
//     const availStart = DateTime.fromObject(
//       { hour: this._availConfig.hour.total.start },
//       { zone: this._availConfig.timeZone }
//     );
//     console.log(availStart);
//   }
// }

// const testEvent = {
//   deadlineDate: "2022-12-10",
//   deadlineTime: "15:00",
//   allowSplit: true,
//   estimatedDuration: '{"hour":1}',
//   splitDuration: '{"hour":1}',
//   startDate: "2022-11-30",
//   startTime: "15:00",
//   taskName: "task",
//   priority: "medium",
// };

// const sched = new Scheduler(testEvent);
// sched.generateAllTimeslots();
