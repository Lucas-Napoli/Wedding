const pool = require("../models/db");

// Enviar convite para um parceiro
exports.sendInvite = async (req, res) => {
    const { shared_user_email } = req.body;

    try {
        // Verifica se o usuário convidado existe
        const [user] = await pool.query("SELECT id FROM users WHERE email = ?", [shared_user_email]);

        if (user.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const shared_user_id = user[0].id;

        // Insere o convite na tabela de permissões
        await pool.query(
            "INSERT INTO user_permissions (owner_id, shared_user_id) VALUES (?, ?)",
            [req.user.id, shared_user_id]
        );

        res.json({ message: "Convite enviado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
