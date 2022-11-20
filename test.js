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
    StartTime: "2022-11-19T09:45:00.000Z",
    EndTime: "2022-11-19T12:30:00.000Z",
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
console.log("before");
console.log(availableTime);

// Iterate through the events and modify available time
eventsList.forEach((e) => {
  let lastKey = Object.keys(availableTime).length - 1;
  let lastAvailableTime = availableTime[Object.keys(availableTime).length - 1];
  if (e.StartTime > lastAvailableTime.StartTime) {
    availableTime[lastKey] = {
      StartTime: lastAvailableTime.StartTime,
      EndTime: e.StartTime,
      Duration: "xx",
    };
    if (e.EndTime < lastAvailableTime.EndTime) {
      availableTime[lastKey + 1] = {
        StartTime: e.EndTime,
        EndTime: lastAvailableTime.EndTime,
        Duration: "xx",
      };
    }
  } else if (e.StartTime <= lastAvailableTime.StartTime) {
    if (
      e.EndTime >= lastAvailableTime.StartTime &&
      e.EndTime <= lastAvailableTime.EndTime
    ) {
      availableTime[lastKey] = {
        StartTime: e.EndTime,
        EndTime: lastAvailableTime.EndTime,
        Duration: "xx",
      };
    }
  } else if (e.EndTime >= lastAvailableTime.EndTime) {
    if (
      e.StartTime <= lastAvailableTime.EndTime &&
      e.StartTime >= lastAvailableTime.StartTime
    ) {
      availableTime[lastKey] = {
        StartTime: lastAvailableTime.StartTime,
        EndTime: e.StartTime,
        Duration: "xx",
      };
    }
  }
});

console.log("after");
console.log(availableTime);
