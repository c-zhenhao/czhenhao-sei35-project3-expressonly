const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../middleware/auth");
const Users = require("../models/Users");

const usernameOrPasswordError = {
  title: "error",
  message: "username or password error",
};

const dbError = {
  title: "error",
  message: "unable to complete request",
};

// try inserting cors into endpoint
const cors = require("cors");
router.use(
  cors({
    credentials: true,
    origin: "https://czhenhao-sei-35-project3.vercel.app",
  })
);
router.use(function (req, res, next) {
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
////////////////////////////////////////

router.patch("/", auth, async (req, res) => {
  try {
    await Users.findByIdAndUpdate(req.session.userId, req.body);
    res.json({ title: "OK", message: "profile updated" });
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    res.json(
      await Users.findById(req.session.userId, { _id: 0, passwordHash: 0 })
    );
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    res.json(await Users.findById(req.params.id, { _id: 0, passwordHash: 0 }));
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.post("/:id/rate", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.session.userId, {
      _id: 0,
      passwordHash: 0,
    });
    const userInteracted = user.userInteracted.map((d, i) => {
      if (d.targetUsername === req.body.targetUsername)
        d.targetRating = req.body.targetRating;
      return d;
    });
    await Users.findByIdAndUpdate(req.session.userId, { userInteracted });

    const target = await Users.findOne({ username: req.body.targetUsername });
    const userRating = target.userRating;
    userRating.push(parseFloat(req.body.targetRating));
    // console.log(target, target.id, userRating);
    await Users.findByIdAndUpdate(target.id, { userRating });

    res.json({ title: "OK", message: `rating successful` });
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.delete("/", async (req, res) => {
  try {
    const user = await Users.findById(req.body.userId);
    const result = await bcrypt.compare(req.body.password, user.passwordHash);
    if (result) {
      const targetList = await Users.find({
        userInteracted: { $elemMatch: { targetUsername: req.body.username } },
      });
      for (let target of targetList) {
        let userInteracted = target.userInteracted.filter(
          (ea) => ea.targetUsername !== req.body.username
        );
        const check = await Users.findByIdAndUpdate(target.id, {
          userInteracted,
        });
      }
      const done = await Users.deleteOne({ _id: user._id });
      if (done.deletedCount === 1) {
        res.json({ title: "OK", message: `profile deleted` });
      } else {
        res.json({ title: "error", message: `unable to delete profile` });
      }
    } else {
      res.status(401).json(usernameOrPasswordError);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

module.exports = router;
