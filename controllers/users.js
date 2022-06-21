const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../middleware/auth");
const Users = require("../models/Users");

const usernameOrPasswordError = {
  title: "error",
  message: "username or password error",
};

router.put("/signup", async (req, res) => {
  try {
    req.body.userRating = [2.5];
    req.body.userInteracted = [];
    req.body.interests = req.body.interests ? req.body.interests : [];
    req.body.passwordHash = await bcrypt.hash(req.body.password, 12);
    const createdUser = await Users.create(req.body);
    console.log("created user is: ", createdUser);
    if (createdUser) {
      req.session.currentUser = createdUser.username;
      req.session.userId = createdUser.id;
      res.json({ userId: createdUser.id, profile: createdUser });
    } else {
      res.status(401).json({ title: "error", message: `unable to create user` });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ title: "error", message: `unable to complete request` });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Users.findOne({ username });

    if (user === null) {
      return res.status(401).send(usernameOrPasswordError);
    }

    const result = await bcrypt.compare(password, user.passwordHash);
    if (result) {
      req.session.currentUser = user.username;
      req.session.userId = user.id;
      res.json({ userId: user.id, profile: user });
    } else {
      res.status(401).json(usernameOrPasswordError);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ title: "error", message: `unable to login` });
  }
});

router.get("/logout", auth, async (req, res) => {
  try {
    req.session.destroy(() => {
      res.json({ title: "OK", message: `logout successful` });
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ title: "error", message: `unable to logout` });
  }
});

module.exports = router;
