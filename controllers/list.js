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
    const { userInteracted } = await Users.findById(req.session.userId);
    const filteredList = userInteracted.filter((target) => target.swiped);
    const matchedList = [];
    for (let { targetUsername } of filteredList) {
      const target = await Users.findOne({ username: targetUsername });
      target.userInteracted.forEach((ea) => {
        if (ea.targetUsername === req.session.currentUser && ea.swiped) matchedList.push(target);
      });
    }
    res.json(
      matchedList.map((ea) => ({
        id: ea._id,
        displayName: ea.displayName,
        userRating: ea.userRating,
        imgUrl: ea.imgUrl,
      }))
    );
  } catch (err) {
    // console.error(err);
    res.status(400).json(dbError);
  }
});

module.exports = router;
