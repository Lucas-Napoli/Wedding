const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Cadastro de usuário
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ error: "Erro ao inserir no banco de dados!" });
    }

    const user = { id: result.insertId, name, email };

    // 🔹 Criar token JWT e garantir que seja enviado
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user }); // 🔹 Retorna token e usuário
  } catch (err) {
    console.error("Erro no backend:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

// Login de usuário
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Email ou senha incorretos!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
