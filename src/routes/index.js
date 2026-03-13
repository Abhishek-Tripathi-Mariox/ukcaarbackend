
const router = require("express").Router();

router.use("/user", require("./UserRoute"));
router.use("/ride", require("./RideRoute"));

module.exports = router;