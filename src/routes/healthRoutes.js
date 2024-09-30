const express = require("express");
const { healthCheck } = require("../controllers/healthController");
const methodHandler = require("../middlewares/methodHandler");
const payloadChecker = require("../middlewares/payloadChecker");
const setHealthCheckerHeader = require("../middlewares/setHealthCheckerHeaders");

const router = express.Router();

// Middlewares
router.use(setHealthCheckerHeader);
router.use(methodHandler(["GET"]));
router.use(payloadChecker);

// Define /healthz route
router.get("/", healthCheck);

module.exports = router;
