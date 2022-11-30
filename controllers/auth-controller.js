const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnAuthenticatedError } = require("../errors/index.js");
const User = require("../models/User.js");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL
);

/**
 * This is one of the many ways you can configure googleapis to use authentication credentials.  In this method, we're setting a global reference for all APIs.  Any other API you use here, like google.drive('v3'), will now use this auth client. You can also override the auth client at the service and method call levels.
 */
google.options({ auth: oauth2Client });

const register = async (req, res) => {
  const { name, email, password } = req.body;

  /* This is checking if the user has provided all the required values. If not, it will throw an error. */
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    throw new BadRequestError("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
    },
    token,
    location: user.location,
  });
};

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
};

const generateAuthUrl = ({ email }) => {
  // generate a url that asks permissions for Google Calendar scopes
  const scopes = ["https://www.googleapis.com/auth/calendar"];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    // If you only need one scope you can pass it as a string
    scope: scopes,
    login_hint: email,
  });

  return url;
};

const registerWithGoogle = async (req, res) => {
  const { credential } = req.body;

  if (credential) {
    const verificationResponse = await verifyGoogleToken(credential);
    if (verificationResponse.error) {
      throw new UnAuthenticatedError("Invalid user detected. Please try again");
    }

    const profile = verificationResponse?.payload;

    // DB.push(profile);
    console.log(profile);
    const authUrl = generateAuthUrl({ email: profile?.email });

    res.status(StatusCodes.CREATED).json({
      message: "Signup was successful",
      authUrl: authUrl,
      user: {
        name: profile?.name,
        firstName: profile?.firstName,
        lastName: profile?.family_name,
        picture: profile?.picture,
        email: profile?.email,
      },
      token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      }),
    });
  }
};

const oauthCallback = async (req, res) => {
  // This will provide an object with the access_token and refresh_token.
  // Save these somewhere safe so they can be used at a later time.
  const { code } = req.query;
  console.log(req.query);
  console.log(`[oauthCallback] code passed by the request: ${code}`);
  const { tokens } = await oauth2Client.getToken(code);
  console.log(`[oauthCallback] Oauth2 token generated:`);
  console.log(tokens);
  oauth2Client.setCredentials(tokens);
  console.log(`[oauthCallback] OAuth2 client credentials set with a token`);
  res.redirect("http://localhost:3000/calendar");
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  //   const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  user.password = undefined;
  res.status(StatusCodes.OK).json({
    user,
    token,
    location: user.location,
  });
};

// const updateUser = async (req, res) => {
//   const { email, name, lastName, location } = req.body;
//   if (!email || !name || !lastName || !location) {
//     throw new BadRequestError("Please provide all values");
//   }
//   const user = await User.findOne({ _id: req.user.userId });

//   user.email = email;
//   user.name = name;
//   user.lastName = lastName;
//   user.location = location;

//   await user.save();

//   const token = user.createJWT();

//   res.status(StatusCodes.OK).json({ user, token, location: user.location });
// };

module.exports = {
  register,
  registerWithGoogle,
  login,
  oauthCallback,
  oauth2Client,
  // updateUser
};
