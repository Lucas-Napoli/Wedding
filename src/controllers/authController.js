const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Cadastro de usuário
exports.registerUser = async (req, res) => {
    const { name, email, password, budget } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, budget) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, budget || 0]
        );

        res.json({ id: result.insertId, name, email, budget });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login de usuário
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

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
