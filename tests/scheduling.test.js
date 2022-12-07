const {
  filterAvailableTimeslots,
  addTimeslotDuration,
} = require("../controllers/test-controller");

describe("auto-scheduling unit tests", () => {
  describe("create available timeslots - for multiple days with multiple events", () => {
    const availableTimeslots = [
      {
        StartTime: "2022-11-19T08:00:00.000Z",
        EndTime: "2022-11-19T22:00:00.000Z",
      },
      {
        StartTime: "2022-11-20T08:00:00.000Z",
        EndTime: "2022-11-20T22:00:00.000Z",
      },
      {
        StartTime: "2022-11-21T08:00:00.000Z",
        EndTime: "2022-11-21T22:00:00.000Z",
      },
    ];
    test("available timeslot should be split into multiple parts", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T09:00:00.000Z",
          EndTime: "2022-11-19T09:45:00.000Z",
        },
        {
          StartTime: "2022-11-19T09:45:00.000Z",
          EndTime: "2022-11-19T12:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T15:00:00.000Z",
          EndTime: "2022-11-19T16:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T20:00:00.000Z",
          EndTime: "2022-11-19T21:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T09:00:00.000Z",
          EndTime: "2022-11-20T09:45:00.000Z",
        },
        {
          StartTime: "2022-11-20T09:45:00.000Z",
          EndTime: "2022-11-20T12:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T15:00:00.000Z",
          EndTime: "2022-11-20T16:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T20:00:00.000Z",
          EndTime: "2022-11-20T21:00:00.000Z",
        },
        {
          StartTime: "2022-11-21T09:00:00.000Z",
          EndTime: "2022-11-21T09:45:00.000Z",
        },
        {
          StartTime: "2022-11-21T09:45:00.000Z",
          EndTime: "2022-11-21T12:00:00.000Z",
        },
        {
          StartTime: "2022-11-21T15:00:00.000Z",
          EndTime: "2022-11-21T16:00:00.000Z",
        },
        {
          StartTime: "2022-11-21T20:00:00.000Z",
          EndTime: "2022-11-21T21:00:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T09:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T12:00:00.000Z",
          EndTime: "2022-11-19T15:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T16:00:00.000Z",
          EndTime: "2022-11-19T20:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T21:00:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T08:00:00.000Z",
          EndTime: "2022-11-20T09:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T12:00:00.000Z",
          EndTime: "2022-11-20T15:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T16:00:00.000Z",
          EndTime: "2022-11-20T20:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T21:00:00.000Z",
          EndTime: "2022-11-20T22:00:00.000Z",
        },
        {
          StartTime: "2022-11-21T08:00:00.000Z",
          EndTime: "2022-11-21T09:00:00.000Z",
        },
        {
          StartTime: "2022-11-21T12:00:00.000Z",
          EndTime: "2022-11-21T15:00:00.000Z",
        },
        {
          StartTime: "2022-11-21T16:00:00.000Z",
          EndTime: "2022-11-21T20:00:00.000Z",
        },
        {
          StartTime: "2022-11-21T21:00:00.000Z",
          EndTime: "2022-11-21T22:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
  });
  describe("create available timeslots - for one day with one to two events", () => {
    const availableTimeslots = [
      {
        StartTime: "2022-11-19T08:00:00.000Z",
        EndTime: "2022-11-19T22:00:00.000Z",
      },
    ];
    test("available timeslot should be split into two parts", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T09:00:00.000Z",
          EndTime: "2022-11-19T09:45:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T09:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T09:45:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
    test("available timeslot should be split into three parts", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T09:00:00.000Z",
          EndTime: "2022-11-19T09:45:00.000Z",
        },
        {
          StartTime: "2022-11-19T10:00:00.000Z",
          EndTime: "2022-11-19T10:45:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T09:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T09:45:00.000Z",
          EndTime: "2022-11-19T10:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T10:45:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
    test("available timeslot should be cut into smaller timeslot (1)", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T09:45:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T09:45:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
    test("available timeslot should be cut into smaller timeslot (2)", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T21:00:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T21:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
  });
  describe("create available timeslots - for two days with one to two events", () => {
    const availableTimeslots = [
      {
        StartTime: "2022-11-19T08:00:00.000Z",
        EndTime: "2022-11-19T22:00:00.000Z",
      },
      {
        StartTime: "2022-11-20T08:00:00.000Z",
        EndTime: "2022-11-20T22:00:00.000Z",
      },
    ];
    test("available timeslot should be split into four parts, two parts per day", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T09:00:00.000Z",
          EndTime: "2022-11-19T09:45:00.000Z",
        },
        {
          StartTime: "2022-11-20T09:00:00.000Z",
          EndTime: "2022-11-20T09:45:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T09:00:00.000Z",
        },
        {
          StartTime: "2022-11-19T09:45:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T08:00:00.000Z",
          EndTime: "2022-11-20T09:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T09:45:00.000Z",
          EndTime: "2022-11-20T22:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
    test("available timeslot should be cut into two smaller timeslot, one timeslot per day (1)", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T09:45:00.000Z",
        },
        {
          StartTime: "2022-11-20T08:00:00.000Z",
          EndTime: "2022-11-20T09:45:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T09:45:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T09:45:00.000Z",
          EndTime: "2022-11-20T22:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
    test("available timeslot should be cut into two smaller timeslot, one timeslot per day (2)", () => {
      const eventTimeslots = [
        {
          StartTime: "2022-11-19T21:00:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T21:00:00.000Z",
          EndTime: "2022-11-20T22:00:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T21:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T08:00:00.000Z",
          EndTime: "2022-11-20T21:00:00.000Z",
        },
      ];

      const result = filterAvailableTimeslots(
        availableTimeslots,
        eventTimeslots
      );
      expect(result).toStrictEqual(resultTimeslots);
    });
  });
  describe("add duration to timeslots", () => {
    test("add duration to timeslots", () => {
      const timeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
        },
        {
          StartTime: "2022-11-20T08:00:00.000Z",
          EndTime: "2022-11-20T22:00:00.000Z",
        },
      ];
      const resultTimeslots = [
        {
          StartTime: "2022-11-19T08:00:00.000Z",
          EndTime: "2022-11-19T22:00:00.000Z",
          duration: { hours: 14, minutes: 0 },
        },
        {
          StartTime: "2022-11-20T08:00:00.000Z",
          EndTime: "2022-11-20T22:00:00.000Z",
          duration: { hours: 14, minutes: 0 },
        },
      ];
      const result = addTimeslotDuration(timeslots);
      expect(result).toStrictEqual(resultTimeslots);
    });
  });
});
