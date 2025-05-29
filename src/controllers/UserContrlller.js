const UserService = require("../services/UserService");
const { generateToken } = require("./LoginController");
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
    await UserService.deleteUser(req.params.id);
    if (!user)
      return res.status(404).send({ message: "Usuário nao encontrado" });
    return res.status(200).send({ message: "Usuário deletado com sucesso!" });
  },
};

// Documentação da API

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operações relacionadas a usuários
 */

/**
 * @swagger
 * /v1/user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retorna a lista de usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários ou mensagem quando não há usuários
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           firstname:
 *                             type: string
 *                             example: "John"
 *                           surname:
 *                             type: string
 *                             example: "Doe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           password:
 *                             type: string
 *                             example: "$2b$10$1234567890abcdefg"
 *                     total:
 *                       type: integer
 *                       example: 1
 *                 - type: string
 *                   example: "Nenhum usuário cadastrado"
 *
 *   post:
 *     tags:
 *       - Users
 *     summary: Cria um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - surname
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *               confirmPassword:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário criado com sucesso!"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstname:
 *                       type: string
 *                       example: "John"
 *                     surname:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Erro de validação ou erro ao criar usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro de validação"
 *                 error:
 *                   type: string
 *                   example: "\"firstname\" is required"
 */

/**
 * @swagger
 * /v1/user/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Busca um usuário pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado (retorna apenas dados públicos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstname:
 *                   type: string
 *                   example: "John"
 *                 surname:
 *                   type: string
 *                   example: "Doe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário nao encontrado"
 *
 *   put:
 *     tags:
 *       - Users
 *     summary: Atualiza um usuário existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário atualizado com sucesso!"
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstname:
 *                       type: string
 *                       example: "John"
 *                     surname:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário nao encontrado"
 *
 *   delete:
 *     tags:
 *       - Users
 *     summary: Deleta um usuário pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário deletado com sucesso!"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário nao encontrado"
 */
