const UserService = require("../services/UserService");
const { generateToken } = require("./LoginController");

module.exports = {
  async index(req, res) {
    const users = await UserService.listUsers();
    if (!users.length) return res.status(200).send("Nenhum usuário cadastrado");
    return res.status(200).json({ users, total: users.length });
  },

  async show(req, res) {
    const user = await UserService.findUserById(req.params.id);
    if (!user)
      return res.status(404).send({ message: "Usuário nao encontrado" });
    return res.json(user);
  },

  async store(req, res) {
    try {
      console.log("req.body:", req.body);
      const user = await UserService.createUser(req.body);
      const token = generateToken({ id: user.id });
      return res.status(200).send({
        message: "Usuário criado com sucesso!",
        user,
        token,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error); // Mostra erro real
      return res.status(500).send({
        message: "Erro interno ao criar o usuário",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    const user = await UserService.updateUser(req.params.id, req.body);
    if (!user)
      return res.status(404).send({ message: "Usuário nao encontrado" });
    return res
      .status(200)
      .send({ message: "Usuário atualizado com sucesso!", user });
  },

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
 * /v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retorna a lista de usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   firstname:
 *                     type: string
 *                     example: "John"
 *                   surname:
 *                     type: string
 *                     example: "Doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *                   password:
 *                     type: string
 *                     example: "$2b$10$1234567890abcdefg"
 *
 *   post:
 *     tags:
 *       - Users
 *     summary: Cria um novo usuário
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário criado com sucesso!"
 */

/**
 * @swagger
 * /v1/users/{id}:
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
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
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
 *                   example: "Usuário não encontrado"
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
 *             required:
 *               - firstname
 *               - surname
 *               - email
 *               - password
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
 */
