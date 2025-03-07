const pool = require("../models/db");

// Criar um novo convidado
exports.createGuest = async (req, res) => {
    const { name, confirmed } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Nome e confirmação são obrigatórios!" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO guests (user_id, name, confirmed) VALUES (?, ?, ?)",
            [req.user.id, name, confirmed]
        );

        res.json({ id: result.insertId, name, confirmed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar os convidados do usuário logado
exports.listGuests = async (req, res) => {
    try {
        const [result] = await pool.query(
            "SELECT id, name, confirmed FROM guests WHERE user_id = ?",
            [req.user.id]
        );

        res.json({ convidados: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Atualizar a confirmação de presença
exports.updateGuestConfirmation = async (req, res) => {
    const { confirmed } = req.body;
    const { id } = req.params;

    if (typeof confirmed !== "boolean") {
        return res.status(400).json({ error: "O campo 'confirmed' deve ser true ou false" });
    }

    try {
        const [update] = await pool.query(
            "UPDATE guests SET confirmed = ? WHERE id = ? AND user_id = ?",
            [confirmed, id, req.user.id]
        );

        if (update.affectedRows === 0) {
            return res.status(404).json({ error: "Convidado não encontrado!" });
        }

        res.json({ message: "Confirmação de presença atualizada!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remover um convidado
exports.deleteGuest = async (req, res) => {
    const { id } = req.params;

    try {
        const [deleteGuest] = await pool.query(
            "DELETE FROM guests WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (deleteGuest.affectedRows === 0) {
            return res.status(404).json({ error: "Convidado não encontrado!" });
        }

        res.json({ message: "Convidado removido com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
