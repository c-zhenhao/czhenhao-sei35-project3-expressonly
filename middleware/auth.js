module.exports = (req, res, next) => {
  console.log(`auth.js ${req.session}`);
  console.log(`auth.js ${req.session.userId}`);
  console.log(`auth.js ${req.session.currentUser}`);
  if (req.session.userId) {
    console.log(`logged in as ${req.session.currentUser}`);
    next();
  } else {
    res.status(403).json({ title: "error", message: "not logged in" });
  }
};
