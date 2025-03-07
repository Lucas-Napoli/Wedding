const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rota de cadastro de usuário
router.post("/register", authController.registerUser);

// Rota de login de usuário
router.post("/login", authController.loginUser);

module.exports = router;
