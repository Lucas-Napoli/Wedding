const express = require("express");
const router = express.Router();

const guestsRoutes = require("./guestsRoutes");
const authRoutes = require("./authRoutes");
const inviteRoutes = require("./inviteRoutes");

router.use("/guests", guestsRoutes);
router.use("/auth", authRoutes);
router.use("/invite", inviteRoutes);

module.exports = router;
