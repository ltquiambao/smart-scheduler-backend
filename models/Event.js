const { object, string, boolean } = require("yup");
const { DateTime } = require("luxon");

// const eventSchema = ({ timeZone }) =>
//   object().shape({
//     taskName: string().default(() => `Event name ${Math.random() * 100}`),
//     priority: string().default("low"),
//     estimatedDuration: string().default(JSON.stringify({ minute: 30 })),
//     splitDuration: string().default(JSON.stringify({ minute: 30 })),
//     allowSplit: boolean().default(false),
//     startDate: string().default(() => {
//       const dateTime = DateTime.now().setZone(timeZone || 'utc');
//       const date = dateTime.toFormat("yyyy-LL-dd");
//       return date;
//     }),
//     startTime: string().default(() => {
//       const dateTime = DateTime.now().setZone(timeZone || 'utc');
//       const minutes = dateTime.minute;
//       const nextMinute5 = minutes + (5 - (minutes % 5));
//       const time = dateTime.set({ minute: nextMinute5 }).toFormat("T");
//       return time;
//     }),
//     deadlineDate: string().ensure().required(),
//     deadlineTime: string().ensure().required(),
//   });

const eventSchema = object().shape({
  taskName: string().required(),
  priority: string().required(),
  estimatedDuration: string().required(),
  splitDuration: string().required(),
  allowSplit: boolean().required(),
  startDate: string().required(),
  startTime: string().required(),
  deadlineDate: string().required(),
  deadlineTime: string().required(),
});

module.exports = eventSchema;
