const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authConfig = require("../config/auth");

function generateToken(payload, expiresIn = "1h") {
  const token = jwt.sign(payload, authConfig.secret, { expiresIn });
  try {
    const decoded = jwt.verify(token, authConfig.secret);
    console.log("Token gerado:", token);
    console.log("Decoded payload:", decoded);
  } catch (error) {
    console.error("Erro ao verificar token criado:", error);
  }

  return token;
}

module.exports = {
  generateToken,

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email e senha são obrigatórios",
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({
          message: "Email ou senha incorretos",
        });
      }

      let isPasswordValid = await bcrypt.compare(password, user.password);

      if (
        !isPasswordValid &&
        (process.env.NODE_ENV === "development" ||
          process.env.NODE_ENV !== "production")
      ) {
        const newHash = await bcrypt.hash(password, 10);
        const newHashTest = await bcrypt.compare(password, newHash);

        if (newHashTest) {
          await User.update({ password: newHash }, { where: { id: user.id } });

          isPasswordValid = true;

          user.password = newHash;
        }
      }

      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Email ou senha incorretos",
        });
      }

      const updatedUser = await User.findOne({
        where: { id: user.id },
        attributes: ["id", "firstname", "surname", "email", "createdAt"],
      });

      const tokenPayload = {
        id: updatedUser.id,
        firstname: updatedUser.firstname,
        surname: updatedUser.surname,
        email: updatedUser.email,
      };
      const token = generateToken(tokenPayload);
      return res.status(200).json({
        message: "Usuário logado com sucesso!",
        token,
      });
    } catch (error) {
      console.error("❌ Erro no login:", error);
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  },
};

/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: Operações relacionadas a autenticação
 */

/**
 * @swagger
 * /v1/login:
 *   post:
 *     tags:
 *       - Login
 *     summary: Realiza login do usuário
 *     description: Autentica o usuário com email e senha, retornando um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "lucasalef@email.com.br"
 *                 description: "Email do usuário"
 *               password:
 *                 type: string
 *                 example: "123456"
 *                 description: "Senha do usuário"
 *
 *
 *
 *
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário logado com sucesso!"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjM5NTc4MDAwLCJleHAiOjE2Mzk2NjQ0MDB9.abc123..."
 *                   description: "Token JWT para autenticação (válido por 24h)"
 *       400:
 *         description: Dados inválidos ou credenciais incorretas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missing_fields:
 *                       value: "Email e senha são obrigatórios"
 *                       summary: "Campos obrigatórios não fornecidos"
 *                     invalid_credentials:
 *                       value: "Email ou senha incorretos"
 *                       summary: "Credenciais inválidas"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 *                   description: "Detalhes do erro (apenas em desenvolvimento)"
 */
