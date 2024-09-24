const express = require("express");
const { healthCheck } = require("../controllers/healthController");
const methodFilter = require("../middlewares/methodFilter");
const payloadChecker = require("../middlewares/payloadChecker");
const setHealthCheckerHeader = require("../middlewares/setHealthCheckerHeaders");

const router = express.Router();

// Middlewares
router.use(setHealthCheckerHeader);
router.use(methodFilter);
router.use(payloadChecker);

// Define /healthz route
router.get("/healthz", healthCheck);

module.exports = router;
