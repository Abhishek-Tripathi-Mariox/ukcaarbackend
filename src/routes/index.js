
const router = require("express").Router();

router.use("/user", require("./UserRoute"));
router.use("/ride", require("./RideRoute"));
router.use("/driver", require("./DriverRoute"));

module.exports = router;