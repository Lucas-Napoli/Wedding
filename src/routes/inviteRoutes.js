const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const inviteController = require("../controllers/inviteController");

// Rota para convidar um parceiro para o planejamento
router.post("/", authenticateToken, inviteController.sendInvite);

module.exports = router;
