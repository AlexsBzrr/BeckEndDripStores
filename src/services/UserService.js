const bcrypt = require("bcrypt");
const User = require("../models/User");

const UserService = {
  async listUsers() {
    return await User.findAll();
  },

  async findUserById(id) {
    return await User.findByPk(id);
  },

  async createUser(data) {
    if ("confirmPassword" in data) {
      delete data.confirmPassword;
    }

    const userExists = await User.findOne({ where: { email: data.email } });

    if (userExists) {
      console.log("❌ Email já existe");
      const error = new Error("E-mail já está em uso.");
      error.status = 400;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const hashTest = await bcrypt.compare(data.password, passwordHash);

    if (!hashTest) {
      throw new Error("Erro ao criar hash da senha");
    }

    // const originalPassword = data.password;
    data.password = passwordHash;

    console.log("Salvando usuário no banco...");
    console.log("Dados do usuário:", { ...data, password: "[HASH_HIDDEN]" });

    const user = await User.create(data);

    return user;
  },

  async updateUser(id, data) {
    await User.update(data, { where: { id } });
    return await User.findByPk(id);
  },

  async deleteUser(id) {
    return await User.destroy({ where: { id } });
  },
};

module.exports = UserService;
