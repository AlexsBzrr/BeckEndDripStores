// Documentação da API

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Operações relacionadas a produtos
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
 *          application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               name:
 *                 type: string
 *                 example: "Produto Exemplo"
 *                 description: "Nome do produto (obrigatório)"
 *               slug:
 *                 type: string
 *                 example: "produto-exemplo"
 *                 description: "Slug único (gerado automaticamente se não fornecido)"
 *               stock:
 *                 type: integer
 *                 default: 0
 *                 example: 10
 *               description:
 *                 type: string
 *                 default: ""
 *                 example: "Descrição detalhada do produto"
 *               price:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 example: 119.90
 *               price_with_discount:
 *                 type: number
 *                 format: float
 *                 example: 99.90
 *                 description: "Preço com desconto (opcional)"
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 15, 24]
 *                 description: "IDs das categorias associadas"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Arquivos de imagem do produto"
 *               options:
 *                 type: string
 *                 example:
 *                   '[{
 *                   "title":"Tamanho",
 *                   "shape":"square",
 *                   "radius":"4px",
 *                   "type":"text",
 *                   "values":["P","M","G"]
 *                  }]'
 *                 description: "JSON string ou array com opções do produto"
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
 *                 name:
 *                   type: string
 *                   example: "Produto Exemplo"
 *                 slug:
 *                   type: string
 *                   example: "produto-exemplo"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Name is required"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */

/**
 * @swagger
 * /v1/product/search:
 *   get:
 *     tags:
 *       - Products
 *     summary: Busca produtos com filtros avançados
 *     description: Busca produtos com paginação, filtros por categoria, preço, opções e busca por texto
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: "Limite de produtos por página"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número da página"
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         example: "id,name,price,slug"
 *         description: "Campos específicos para retornar (separados por vírgula)"
 *       - in: query
 *         name: match
 *         schema:
 *           type: string
 *         example: "bermuda"
 *         description: "Busca por texto no nome ou descrição"
 *       - in: query
 *         name: category_ids
 *         schema:
 *           type: string
 *         example: ""
 *         description: "IDs das categorias (separados por vírgula)"
 *       - in: query
 *         name: price-range
 *         schema:
 *           type: string
 *         example: ""
 *         description: "Faixa de preço (min-max)"
 *       - in: query
 *         name: option[45]
 *         schema:
 *           type: string
 *         example: ""
 *         description: "Filtro por opção específica (option[ID_OPCAO]=valores)"
 *     responses:
 *       200:
 *         description: Lista de produtos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       enabled:
 *                         type: boolean
 *                         example: true
 *                       name:
 *                         type: string
 *                         example: "Produto Exemplo"
 *                       slug:
 *                         type: string
 *                         example: "produto-exemplo"
 *                       stock:
 *                         type: integer
 *                         example: 10
 *                       description:
 *                         type: string
 *                         example: "Descrição do produto"
 *                       price:
 *                         type: number
 *                         example: 119.90
 *                       price_with_discount:
 *                         type: number
 *                         example: 99.90
 *                       category_ids:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [1, 2]
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             path:
 *                               type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             title:
 *                               type: string
 *                             shape:
 *                               type: string
 *                             radius:
 *                               type: string
 *                             type:
 *                               type: string
 *                             values:
 *                               type: string
 *                             product_id:
 *                               type: integer
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 limit:
 *                   type: integer
 *                   example: 12
 *                 page:
 *                   type: integer
 *                   example: 1
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /v1/product/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Busca um produto pelo ID
 *     description: Retorna os dados completos de um produto específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     enabled:
 *                       type: boolean
 *                       example: true
 *                     name:
 *                       type: string
 *                       example: "Produto Exemplo"
 *                     slug:
 *                       type: string
 *                       example: "produto-exemplo"
 *                     stock:
 *                       type: integer
 *                       example: 10
 *                     description:
 *                       type: string
 *                       example: "Descrição do produto"
 *                     price:
 *                       type: number
 *                       example: 119.90
 *                     price_with_discount:
 *                       type: number
 *                       example: 99.90
 *                     category_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2]
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           path:
 *                             type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           shape:
 *                             type: string
 *                           radius:
 *                             type: string
 *                           type:
 *                             type: string
 *                           values:
 *                             type: string
 *                           product_id:
 *                             type: integer
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Produto não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /v1/product/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Atualiza um produto existente
 *     description: Atualiza dados do produto, incluindo imagens, opções e categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *               name:
 *                 type: string
 *                 example: "Produto Atualizado"
 *               slug:
 *                 type: string
 *                 example: "produto-atualizado"
 *               stock:
 *                 type: integer
 *                 example: 5
 *               description:
 *                 type: string
 *                 example: "Nova descrição do produto"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 129.90
 *               price_with_discount:
 *                 type: number
 *                 format: float
 *                 example: 109.90
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3, 5]
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Novas imagens (substituem as existentes)"
 *               options:
 *                 type: string
 *                 example: '[{"title":"Cor","type":"text","values":["Azul","Verde"]}]'
 *                 description: "Novas opções (substituem as existentes)"
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto atualizado com sucesso"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     enabled:
 *                       type: boolean
 *                       example: true
 *                     name:
 *                       type: string
 *                       example: "Produto Atualizado"
 *                     slug:
 *                       type: string
 *                       example: "produto-atualizado"
 *                     stock:
 *                       type: integer
 *                       example: 5
 *                     description:
 *                       type: string
 *                       example: "Nova descrição do produto"
 *                     price:
 *                       type: number
 *                       example: 129.90
 *                     price_with_discount:
 *                       type: number
 *                       example: 109.90
 *                     category_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 3, 5]
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Dados inválidos"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["name must be a string"]
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Produto não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /v1/product/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Remove um produto existente
 *     description: Deleta permanentemente um produto do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto deletado com sucesso!"
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Produto não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                   description: "Detalhes do erro (apenas em desenvolvimento)"
 *                 message:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */
