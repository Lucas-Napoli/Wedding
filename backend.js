const express = require("express");
require("dotenv").config();
const app = express();
const routes = require("./src/routes"); // Importando todas as rotas
const { authenticateToken } = require("./src/middleware/authMiddleware");

app.use(express.json());
app.use(routes); // Usando as rotas organizadas

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Backend está rodando!" });
});
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
