const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const cors = require("cors");

const origin = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  `${process.env.FRONTEND_URI}`,
  "*",
];
app.use(
  cors({
    credentials: true,
    origin: "https://czhenhao-sei-35-project3.vercel.app",
  })
);

app.use(function (req, res, next) {
  console.log("Cross-origin Requests");
  console.log(res);
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://czhenhao-sei-35-project3.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "hbs");

const connectDB = require("../db/db");
const mongoURI = `${process.env.MONGODB_URI}`; // /onlyfriends
connectDB(mongoURI);

const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: mongoURI,
  collection: "sessions",
});

app.set("trust proxy", 1); // trust first proxy
app.enable(`trust proxy`); // pls enable
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 60 * 60 * 1000,
    store: store,
    name: "plssavemycookies",
    cookie: { secure: true, httpOnly: false, sameSite: "none" },
    // cookie: { sameSite: "none", httpOnly: false },
  })
);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

module.exports = app;
