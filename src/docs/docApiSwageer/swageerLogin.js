// Documentação da API

/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: Operações relacionadas a autenticação
 */

/**
 * @swagger
 * /v1/login:
 *   post:
 *     tags:
 *       - Login
 *     summary: Realiza login do usuário
 *     description: Autentica o usuário com email e senha, retornando um token JWT
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
 *                 example: "lucasalef@email.com.br"
 *                 description: "Email do usuário"
 *               password:
 *                 type: string
 *                 example: "123456"
 *                 description: "Senha do usuário"
 *
 *
 *
 *
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário logado com sucesso!"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjM5NTc4MDAwLCJleHAiOjE2Mzk2NjQ0MDB9.abc123..."
 *                   description: "Token JWT para autenticação (válido por 24h)"
 *       400:
 *         description: Dados inválidos ou credenciais incorretas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missing_fields:
 *                       value: "Email e senha são obrigatórios"
 *                       summary: "Campos obrigatórios não fornecidos"
 *                     invalid_credentials:
 *                       value: "Email ou senha incorretos"
 *                       summary: "Credenciais inválidas"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 *                   description: "Detalhes do erro (apenas em desenvolvimento)"
 */
