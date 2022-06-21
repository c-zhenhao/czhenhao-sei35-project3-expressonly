const hbs = require("hbs");
const path = require("path");

hbs.registerPartials(path.join(__dirname, "..", "views", "partials"));

hbs.registerHelper("cap", function (str) {
  if (str)
    return str
      .split(" ")
      .map((n) => n[0].toUpperCase() + n.substring(1))
      .join(" ");
});

hbs.registerHelper("isNegative", function (num) {
  if (num) return num < 0;
});

hbs.registerHelper("currency", function (num) {
  if (num) return parseFloat(num).toFixed(2);
});

module.exports = hbs;
