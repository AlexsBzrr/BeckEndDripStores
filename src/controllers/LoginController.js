const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");
const User = require("../models/User");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

module.exports = {
  generateToken,
  async login(req, res) {
    const { email, password, islogged } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send("Email ou senha incorretos");
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send("Email ou senha incorretos");
    }
    const id = user.id;

    await User.update({ islogged: true }, { where: { id: user.id } });

    //para nao retornar a senha ao logar
    user.password = undefined;

    const token = generateToken({ id });

    return res.status(200).json({
      mensagem: "Usuário logado com sucesso!",
      user,
      token,
    });
  },
};

/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: Operações relacionadas a login
 */
/**
 * @swagger
 * /v1/users/login:
 *   post:
 *     tags:
 *       - Login
 *     summary: Registra uma tentativa de login
 *     security:
 *       - bearerAuth: []
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
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Registro de login criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login registrado com sucesso!"
 *                 login:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     ipAddress:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
