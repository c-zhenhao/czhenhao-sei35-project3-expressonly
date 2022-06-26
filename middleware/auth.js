module.exports = (req, res, next) => {
  console.log(`auth.js ${req.session.userId}`);
  if (req.session.userId) {
    next();
  } else {
    res.status(403).json({ title: "error", message: "not logged in" });
  }
};
