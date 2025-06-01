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

/**
 * @swagger
 * /v1/product:
 *   post:
 *     tags:
 *       - Products
 *     summary: Cria um novo produto
 *     description: Cria um novo produto com imagens, opções e categorias
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: # Mudamos para application/json se você vai enviar base64 no corpo
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price # Adicionando price como obrigatório, ajuste se não for
 *               - category_ids # Adicionando category_ids como obrigatório, ajuste se não for
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               name:
 *                 type: string
 *                 example: "Calça Pantalona"
 *                 description: "Nome do produto (obrigatório)"
 *               slug:
 *                 type: string
 *                 example: "Calça-Pantalona"
 *                 description: "Slug único (gerado automaticamente se não fornecido)"
 *               stock:
 *                 type: integer
 *                 default: 0
 *                 example: 10
 *               description:
 *                 type: string
 *                 default: ""
 *                 example: "Descrição da Calça Jeans"
 *               price:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 example: 99.90
 *               price_with_discount:
 *                 type: number
 *                 format: float
 *                 example: 199.90 # No seu exemplo, o preço com desconto é maior, verifique isso
 *                 description: "Preço com desconto (opcional)"
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3, 10]
 *                 description: "IDs das categorias associadas"
 *               images: # Alterado de 'files' para 'images'
 *                 type: array
 *                 description: "Array de objetos de imagem, cada um com path e conteúdo base64"
 *                 items:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                       description: "Caminho ou nome do arquivo da imagem"
 *                       example: "/images/produto-01-img1.png"
 *                     content:
 *                       type: string
 *                       format: byte # Indica que é um conteúdo binário, geralmente base64
 *                       description: "Conteúdo da imagem em formato base64 (com prefixo data URI opcional)"
 *                       example: "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
 *               options: # Estrutura de 'options' alterada
 *                 type: array
 *                 description: "Array de objetos de opção do produto"
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Cor"
 *                     shape:
 *                       type: string
 *                       example: "square"
 *                     radius: # Note que 'radius' no seu exemplo é um número
 *                       type: integer # ou number, se puder ter decimais
 *                       example: 4
 *                     type:
 *                       type: string
 *                       example: "text"
 *                     values:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["P", "M", "G"]
 *             example: # Exemplo principal que aparecerá no Swagger UI
 *               enabled: true
 *               name: "Calça Pantalona"
 *               slug: "Calça-Pantalona"
 *               stock: 10
 *               description: "Descrição da Calça Jeans"
 *               price: 99.90
 *               price_with_discount: 199.90 # Verifique este valor, no seu exemplo está maior que o preço normal
 *               category_ids: [3, 10]
 *               images:
 *                 - path: "/images/produto-01-img1.png"
 *                   content: "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
 *               options:
 *                 - title: "Cor"
 *                   shape: "square"
 *                   radius: 4
 *                   type: "text"
 *                   values: ["P", "M", "G"]
 *                 - title: "Tamanho"
 *                   shape: "circle"
 *                   type: "color"
 *                   values: ["#000"]
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto cadastrado com sucesso!"
 *                 id:
 *                   type: integer
 *                   example: 42
 *                 # ... (outras propriedades da resposta que você retorna)
 *       400:
 *         description: Dados inválidos
 *         # ... (schema da resposta de erro)
 *       500:
 *         description: Erro interno do servidor
 *         # ... (schema da resposta de erro)
 */
