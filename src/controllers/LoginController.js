const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function generateToken(payload, expiresIn = "24h") {
  const secret = process.env.JWT_SECRET;
  console.log("Gerando token com payload:", payload);
  const token = jwt.sign(payload, secret, { expiresIn });
  // Debug: decodificar o token para verificar
  try {
    const decoded = jwt.verify(token, secret);
    console.log("Token criado com dados:", {
      id: decoded.id,
      firstname: decoded.firstname,
      surname: decoded.surname,
      email: decoded.email,
      islogged: decoded.islogged,
    });
  } catch (error) {
    console.error("Erro ao verificar token criado:", error);
  }

  return token;
}

module.exports = {
  generateToken,
  // async login(req, res) {
  //   try {
  //     const { email, password } = req.body;

  //     // Validação de entrada
  //     if (!email || !password) {
  //       return res.status(400).json({
  //         message: "Email e senha são obrigatórios",
  //       });
  //     }

  //     // Buscar usuário
  //     const user = await User.findOne({ where: { email } });

  //     if (!user) {
  //       return res.status(400).json({
  //         message: "Email ou senha incorretos",
  //       });
  //     }

  //     // Verificar senha
  //     let isPasswordValid = await bcrypt.compare(password, user.password);
  //     // SE A SENHA NÃO BATER E ESTAMOS EM DESENVOLVIMENTO
  //     // Corrigir automaticamente hashes corrompidos
  //     if (
  //       !isPasswordValid &&
  //       (process.env.NODE_ENV === "development" ||
  //         process.env.NODE_ENV !== "production")
  //     ) {
  //       // Criar novo hash com a mesma senha
  //       const newHash = await bcrypt.hash(password, 10);
  //       const newHashTest = await bcrypt.compare(password, newHash);

  //       if (newHashTest) {
  //         // Atualizar hash no banco
  //         await User.update({ password: newHash }, { where: { id: user.id } });

  //         isPasswordValid = true;
  //         // Atualizar o objeto user para não ter problemas depois
  //         user.password = newHash;
  //       }
  //     }

  //     // Se ainda não é válida, senha está realmente errada
  //     if (!isPasswordValid) {
  //       return res.status(400).json({
  //         message: "Email ou senha incorretos",
  //       });
  //     }

  //     // Login bem-sucedido
  //     console.log("✅ Login autorizado!");

  //     // Marcar como logado
  //     await User.update({ islogged: true }, { where: { id: user.id } });

  //     // Preparar resposta sem senha
  //     const userResponse = { ...user.toJSON() };
  //     delete userResponse.password;

  //     // Gerar token
  //     const token = generateToken({ id: user.id });

  //     return res.status(200).json({
  //       message: "Usuário logado com sucesso!",
  //       user: userResponse,
  //       token,
  //     });
  //   } catch (error) {
  //     console.error("❌ Erro no login:", error);
  //     return res.status(500).json({
  //       message: "Erro interno do servidor",
  //       error: error.message,
  //     });
  //   }
  // },

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
        console.log("❌ Usuário não encontrado");
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
        console.log("Hash não confere - verificando se precisa corrigir...");

        const newHash = await bcrypt.hash(password, 10);
        const newHashTest = await bcrypt.compare(password, newHash);

        if (newHashTest) {
          console.log("Novo hash funciona - corrigindo no banco...");

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

      const updateResult = await User.update(
        { islogged: true },
        { where: { id: user.id } }
      );
      console.log("Update islogged result:", updateResult);

      const updatedUser = await User.findOne({
        where: { id: user.id },
        attributes: [
          "id",
          "firstname",
          "surname",
          "email",
          "islogged",
          "createdAt",
        ],
      });

      if (!updatedUser.islogged) {
        updatedUser.islogged = true;
        await updatedUser.save();
        await updatedUser.reload();
      }

      const userResponse = {
        id: updatedUser.id,
        firstname: updatedUser.firstname,
        surname: updatedUser.surname,
        email: updatedUser.email,
        islogged: updatedUser.islogged,
        createdAt: updatedUser.createdAt,
      };

      const tokenPayload = {
        id: updatedUser.id,
        firstname: updatedUser.firstname,
        surname: updatedUser.surname,
        email: updatedUser.email,
      };

      const token = generateToken(tokenPayload);

      return res.status(200).json({
        message: "Usuário logado com sucesso!",
        user: userResponse,
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

  async logout(req, res) {
    try {
      const { id } = req.user;
      const updateResult = await User.update(
        { islogged: false },
        { where: { id } }
      );

      return res.status(200).json({
        message: "Logout realizado com sucesso!",
      });
    } catch (error) {
      console.error("❌ Erro no logout:", error);
      return res.status(500).json({
        message: "Erro interno do servidor",
      });
    }
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
