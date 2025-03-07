const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const guestsController = require("../controllers/guestsController");

// Criar um novo convidado
router.post("/create-guests", authenticateToken, guestsController.createGuest);

// Listar os convidados do usuário logado
router.get("/list-guests", authenticateToken, guestsController.listGuests);

// Atualizar a confirmação de presença de um convidado
router.put("/:id", authenticateToken, guestsController.updateGuestConfirmation);

// Remover um convidado
router.delete("/:id", authenticateToken, guestsController.deleteGuest);

module.exports = router;
