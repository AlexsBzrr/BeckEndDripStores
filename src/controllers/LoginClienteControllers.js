const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cliente = require("../models/cliente");
const authConfig = require("../config/auth");

function generateToken(payload, expiresIn = "8h") {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, authConfig.secret, { expiresIn });
  try {
    const decoded = jwt.verify(token, authConfig);
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

      const cliente = await Cliente.findOne({ where: { email } });

      if (!cliente) {
        return res.status(400).json({
          message: "Email ou senha incorretos",
        });
      }

      let isPasswordValid = await bcrypt.compare(password, cliente.password);

      if (
        !isPasswordValid &&
        (process.env.NODE_ENV === "development" ||
          process.env.NODE_ENV !== "production")
      ) {
        const newHash = await bcrypt.hash(password, 10);
        const newHashTest = await bcrypt.compare(password, newHash);

        if (newHashTest) {
          await Cliente.update(
            { password: newHash },
            { where: { id: cliente.id } }
          );
          isPasswordValid = true;
          cliente.password = newHash;
        }
      }

      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Email ou senha incorretos",
        });
      }

      const updatedClient = await Cliente.findOne({
        where: { id: cliente.id },
        attributes: ["id", "nome", "email"],
      });

      const tokenPayload = {
        id: updatedClient.id,
        nome: updatedClient.nome,
        email: updatedClient.email,
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
