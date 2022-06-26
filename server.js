require("dotenv").config();

const app = require("./src/expressLoader");
const hbs = require("./src/hbsLoader");
const path = require("path");
const bcrypt = require("bcrypt");
const users = require("./controllers/users");
const profile = require("./controllers/profile");
const match = require("./controllers/match");
const list = require("./controllers/list");

const Users = require("./models/Users");
const seed = require("./models/seed");

app.use("/users", users);
app.use("/profile", profile);
app.use("/match", match);
app.use("/list", list);

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const randStr = (len) => {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.post("/seed", async (req, res) => {
  for (let ea of seed) {
    ea.passwordHash = await bcrypt.hash("password", 12);
    ea.age = Math.floor(Math.random() * 52) + 18;
    const ind = [];
    for (let i = 0; i < 10; i++) {
      let x = Math.floor(Math.random() * seed.length);
      if (!ind.includes(x) && seed.indexOf(ea) !== x) ind.push(x);
    }
    if (ea.userRating > 5) ea.userRating = [5];
    else if (ea.userRating < 0) ea.userRating = [0];
    else ea.userRating = [ea.userRating];
    ea.userInteracted = seed.filter((d, i) => ind.includes(i));
    ea.userInteracted = ea.userInteracted.map((d) => ({
      targetUsername: d.username,
      swiped: Math.round(Math.random()),
      targetRating: null,
    }));
  }
  await Users.deleteMany({});
  await Users.create(seed, (err, data) => {
    if (err) res.status(400).json({ title: "error", message: "seeding error" });
    else res.json(data);
  });
  //   res.json();
});

app.get("/seed", async (req, res) => {
  try {
    const data = await Users.find();
    res.json(data);
  } catch (err) {
    res
      .status(400)
      .json({ title: "error", message: "unable to complete request" });
  }
});
