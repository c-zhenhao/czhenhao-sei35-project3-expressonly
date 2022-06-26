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
app.use(cors({ credentials: true, origin: origin }));

app.use(function (req, res, next) {
  console.log("Cross-origin Requests");
  console.log(res);
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Origin",
    "https://czhenhao-sei-35-project3.vercel.app/"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
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

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 60 * 60 * 1000,
    store: store,
    // cookie: { sameSite: "none", httpOnly: false },
  })
);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

module.exports = app;
