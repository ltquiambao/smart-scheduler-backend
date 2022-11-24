const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();
const app = express();

const corsOptions = {
  origin: "*",
};

const connectDB = require("./db/connect.js");

// routers
const authRouter = require("./routes/auth-routes.js");
const scheduleRouter = require("./routes/schedule-routes.js");

// middleware
const notFoundMiddleware = require("./middleware/not-found.js");
const errorHandlerMiddleware = require("./middleware/error-handler.js");
const authenticateUser = require("./middleware/auth.js");

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to smart-scheduler backend" });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/schedule", scheduleRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("Successfully connect to MongoDB.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (err) {
    console.error("Connection error", err);
  }
};

start();
