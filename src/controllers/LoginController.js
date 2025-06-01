const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authConfig = require("../config/auth");

function generateToken(payload, expiresIn = "8h") {
  const token = jwt.sign(payload, authConfig.secret, { expiresIn });
  try {
    const decoded = jwt.verify(token, authConfig.secret);
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

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZmlyc3RuYW1lIjoiTHVjYXMiLCJzdXJuYW1lIjoiQWxlZiIsImVtYWlsIjoibHVjYXNhbGVmQGVtYWlsLmNvbS5iciIsImlhdCI6MTc0ODczMTkzMCwiZXhwIjoxNzQ4NzYwNzMwfQ.BsWwqdqM2qIJ8oDir79GKYlFRAHeAin0lDxc3Bnhzz0
