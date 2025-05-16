const User = require("../models/User");

const UserService = {
  async listUsers() {
    return await User.findAll();
  },

  async findUserById(id) {
    return await User.findByPk(id);
  },

  async createUser(data) {
    const userExists = await User.findOne({ where: { email: data.email } });

    if (userExists) {
      const error = new Error("E-mail já está em uso.");
      error.status = 400; // Bad Request
      throw error;
    }

    return await User.create(data);
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
