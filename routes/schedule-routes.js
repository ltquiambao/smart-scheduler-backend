const express = require("express");
// const rateLimiter = require("express-rate-limit");
const router = express.Router();

const {
  getSchedule,
  createEvent,
} = require("../controllers/sched-controller.js");
// import authenticateUser from "../middleware/auth.js";
router.route("/").get(
  // apiLimiter,
  getSchedule
);
router.route("/event").post(
  // apiLimiter,
  createEvent
);

module.exports = router;
