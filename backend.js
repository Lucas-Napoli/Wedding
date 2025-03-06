const express = require("express"); // importa express
const mysql = require("mysql2/promise"); //importa banco de dados
require("dotenv").config()//importa .env com as configurações do sistema
const jwt = require("jsonwebtoken") //importa jwt 
const bcrypt = require("bcrypt")


const app = express() //cria um servidor web.
app.use(express.json()) //permite que o backend leia requisições JSON


//cria uma piscina de conexões para evitar sobrecarga do banco.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

pool.getConnection()
    .then(() => console.log("conexão estabelecida"))
    .catch(err => console.error("error ao conectar", err.message));

// Vamos criar autenticação com JWT
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")
    if (!token) return res.status(401).json({error:"Acesso Negado!"})
    
    jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({error: "Token invalido!"});
        req.user = user;
        next();
    })
}

// endpoint para cadastro de usuario
app.post("/register", async (req, res) => {
    const { name, email, password, budget } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const [result] = await pool.query(
        "INSERT INTO users (name, email, password, budget) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, budget]
      );
      res.json({ id: result.insertId, name, email, budget });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// endpoint para fazer login
/* 
O usuário informa email e senha.
Buscamos no banco pelo email.
Verificamos se a senha está correta (bcrypt.compare()).
Geramos um token JWT e retornamos para o usuário.
*/

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try{
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) return res.status(400).json({error: "Usuario não encontrado"})
        
        const user = rows[0]
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return(400).json({error: "Email ou senha incorretos!"})
        
        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, { expiresIn: "1h"});
        res.json({token});
    }catch(err){
        res.status(500).json({error: err.message});
    }
});

// endpoint para convidar parceiro
/*
O dono do planejamento envia o email do parceiro.
Verificamos se esse usuário existe no banco.
Criamos uma permissão para o parceiro acessar o planejamento
*/
app.post("/invite", authenticateToken, async (req, res) => {
    const { shared_user_email } = req.body;
    try {
      const [user] = await pool.query("SELECT id FROM users WHERE email = ?", [shared_user_email]);
      if (user.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
  
      const shared_user_id = user[0].id;
      await pool.query("INSERT INTO user_permissions (owner_id, shared_user_id) VALUES (?, ?)", [req.user.id, shared_user_id]);
  
      res.json({ message: "Convite enviado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// criação de convidados
app.post("/create-guests", authenticateToken, async (req,res) => {
    const {name,confirmed} = req.body
    try{
        const [result] = await pool.query("INSERT INTO guests (name,confirmed) VALUES (?,?)", [name, confirmed])
        res.json({message: "Convidado cadastrado com sucesso!"})
    }catch(err) { 
        res.status(500).json({error: err.message})
    }
})

// endpoint para mostrar orçamento
/*
O MySQL verifica se o usuário é dono ou parceiro.
Se ele tiver permissão, pode acessar os dados.
*/ 

app.get("/budget", authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.query(
          `SELECT u.budget FROM users u
           LEFT JOIN user_permissions p ON u.id = p.owner_id
           WHERE (u.id = ? OR p.shared_user_id = ?)
           ORDER BY p.owner_id DESC LIMIT 1`,
          [req.user.id, req.user.id]
        );

        if (result.length === 0) return res.status(403).json({ error: "Acesso negado" });

        res.json({ total_budget: result[0].budget });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// iniciar o servidor

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))

