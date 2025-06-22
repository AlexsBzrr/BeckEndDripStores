const UserService = require("../services/UserService");
const { generateToken } = require("./LoginControllers");
const userSchema = require("../validations/userValidation");

//exibição de usuários
module.exports = {
  async index(req, res) {
    try {
      const users = await UserService.listUsers({
        attributes: {
          exclude: ["createdAt", "updatedAt", "password"],
        },
      });

      if (!users.length) {
        return res.status(200).send("Nenhum usuário cadastrado");
      }

      return res.status(200).json({
        message: "Usuários encontrados com sucesso",
        users: users.map((user) => ({
          id: user.id,
          firstname: user.firstname,
          surname: user.surname,
          email: user.email,
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  },

  //exibição de usuário pelo id
  async show(req, res) {
    const user = await UserService.findUserById(req.params.id);
    if (!user)
      return res.status(404).send({ message: "Usuário nao encontrado" });
    return res.json({
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
    });
  },

  //atualização de usuários
  async store(req, res) {
    try {
      const { error, value } = userSchema.validate(req.body, {
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          message: "Erro de validação",
          error: error.details[0].message,
        });
      }

      const { confirmPassword, ...userData } = value;
      const user = await UserService.createUser(userData);

      const tokenPayload = {
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
      };

      const token = generateToken(tokenPayload);

      return res.status(201).json({
        message: "Usuário criado com sucesso!",
        user: {
          id: user.id,
          firstname: user.firstname,
          surname: user.surname,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Erro ao criar usuário",
        error: error.message,
      });
    }
  },
  //atualização de usuários
  async update(req, res) {
    const user = await UserService.updateUser(req.params.id, req.body);
    if (!user)
      return res.status(404).send({ message: "Usuário nao encontrado" });
    return res.status(200).send({
      message: "Usuário atualizado com sucesso!",
      user: {
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
      },
    });
  },
  //exclusão de usuários

  async delete(req, res) {
    const user = await UserService.findUserById(req.params.id);
    if (!user)
      return res.status(404).send({ message: "Usuário nao encontrado" });
    await UserService.deleteUser(req.params.id);
    return res.status(200).send({ message: "Usuário deletado com sucesso!" });
  },
};
