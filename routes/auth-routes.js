const express = require("express");
// const rateLimiter = require("express-rate-limit");
const router = express.Router();

// const apiLimiter = rateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10,
//   message: "Too many requests from this IP, please try again after 15 minutes",
// });

const {
  register,
  registerWithGoogle,
  login,
  oauthCallback,
  // updateUser
} = require("../controllers/auth-controller.js");
router.route("/register").post(
  // apiLimiter,
  register
);
router.route("/register/google").post(
  // apiLimiter,
  registerWithGoogle
);
router.route("/login").post(
  // apiLimiter,
  login
);
router.route("/oauth2callback").get(
  // apiLimiter,
  oauthCallback
);
// router.route("/updateUser").patch(authenticateUser, updateUser);

module.exports = router;
