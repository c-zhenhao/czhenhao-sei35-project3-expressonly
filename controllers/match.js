const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../middleware/auth");
const Users = require("../models/Users");

const dbError = {
  title: "error",
  message: "unable to complete request",
};

router.get("/", auth, async (req, res) => {
  try {
    const { userInteracted, userPreference } = await Users.findById(req.session.userId);
    let { gender, ageMax, ageMin, interested } = userPreference;
    if (gender === "both") gender = ["male", "female"];

    // if (interested.length) interested = { $elemMatch: { $in: interested } };
    // else interested = { $elemMatch: { $nin: [""] } };

    const filter = userInteracted.map(({ targetUsername }) => targetUsername);
    filter.push(req.session.currentUser);

    const toFind = { username: { $nin: filter } };
    if (gender) toFind.gender = gender;
    if (ageMin && ageMax) toFind.$and = [{ age: { $gte: ageMin } }, { age: { $lte: ageMax } }];
    if (interested.length) toFind.interests = { $elemMatch: { $in: interested } };

    res.json(
      await Users.find({ ...toFind }, { passwordHash: 0 }).collation({ locale: "en", strength: 2 })
    );
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { userInteracted } = await Users.findById(req.session.userId);
    userInteracted.push(req.body);
    await Users.findByIdAndUpdate(req.session.userId, { userInteracted });

    if (req.body.swiped) {
      const target = await Users.findOne({ username: req.body.targetUsername });
      const targetInteracted = target.userInteracted.filter(
        (target) => target.targetUsername === req.session.currentUser && target.swiped
      );
      if (targetInteracted.length === 1) res.json({ matched: true });
      else res.json({ matched: false });
    } else {
      res.json({ title: "OK", message: "swiped successful" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.patch("/filters", auth, async (req, res) => {
  try {
    const { userPreference } = req.body;
    await Users.findByIdAndUpdate(req.session.userId, { userPreference });
    res.json({ title: "OK", message: "filters updated" });
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

module.exports = router;
