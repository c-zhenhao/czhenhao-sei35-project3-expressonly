const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsersSchema = Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String }, //hash
  displayName: { type: String },
  userRating: { type: [Number] },
  userInteracted: [{ targetUsername: String, swiped: Boolean, targetRating: Number }],
  gender: { type: String },
  age: { type: Number },
  height: { type: String },
  imgUrl: { type: String },
  interests: { type: Array },
  events: [
    {
      targetUsername: String,
      eventName: String,
      date: Date,
      time: String,
      location: String,
      status: String, // cancelled, rejected, tentative, accepted, sent, etc.
      remarks: String,
    },
  ],
  userPreference: {
    gender: String,
    ageMin: Number,
    ageMax: Number,
    interested: Array,
  },
});
const Users = mongoose.model("Users", UsersSchema);
module.exports = Users;
