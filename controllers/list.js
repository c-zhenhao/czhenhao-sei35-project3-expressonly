const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../middleware/auth");
const Users = require("../models/Users");

const dbError = {
  title: "error",
  message: "unable to complete request",
};

// try inserting cors into endpoint
const cors = require("cors");
router.use(
  cors({
    credentials: true,
    origin: "https://czhenhao-sei-35-project3.vercel.app/",
  })
);
////////////////////////////////////////

router.get("/", auth, cors(), async (req, res) => {
  try {
    const { userInteracted } = await Users.findById(req.session.userId);
    const filteredList = userInteracted.filter((target) => target.swiped);
    const matchedList = [];
    for (let { targetUsername } of filteredList) {
      const target = await Users.findOne({ username: targetUsername });
      target.userInteracted.forEach((ea) => {
        if (ea.targetUsername === req.session.currentUser && ea.swiped)
          matchedList.push(target);
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
