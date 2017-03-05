var statify_controller = require("./controllers/statify_controller.js");

module.exports = function(app) {
  app.get("/", statify_controller.home);
}
  