const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cliente = require("../models/cliente");

function generateToken(payload, expiresIn = "8h") {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, { expiresIn });
  try {
    const decoded = jwt.verify(token, secret);
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
        return res.status(404).json({
          message: "Email ou senha incorretos",
        });
      } else {
        const isPasswordValid = await bcrypt.compare(
          password,
          cliente.password
        );

        if (!isPasswordValid) {
          return res.status(401).json({
            error: "Senha incorreta",
          });
        } else {
          const updatedClient = await Cliente.findOne({
            where: { id: cliente.id },
            attributes: ["id", "nome", "email"],
          });

          if (!updatedClient) {
            await updatedClient.save();
            await updatedClient.reload();
          }

          const clienteRespose = {
            id: updatedClient.id,
            nome: updatedClient.nome,
            email: updatedClient.email,
          };

          const tokenPayload = {
            id: updatedClient.id,
            nome: updatedClient.nome,
            email: updatedClient.email,
          };

          const token = generateToken(tokenPayload);

          return res.status(200).json({
            message: "Login realizado com sucesso",
            data: clienteRespose,
            token,
          });
        }
      }
    } catch (error) {
      console.error("Erro no controller login:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        message: error.message,
      });
    }
  },
};
