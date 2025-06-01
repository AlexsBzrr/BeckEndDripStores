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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: "Se o produto está habilitado"
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
 *                 description: "Quantidade em estoque"
 *               description:
 *                 type: string
 *                 default: ""
 *                 example: "Descrição detalhada do produto"
 *                 description: "Descrição do produto"
 *               price:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 example: 119.90
 *                 description: "Preço do produto"
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
 *                 description: "IDs das categorias associadas (enviar como array ou string JSON)"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Arquivos de imagem do produto"
 *               options:
 *                 type: string
 *                 example: '[{"title":"Tamanho","shape":"square","radius":4,"type":"text","values":["P","M","G"]}]'
 *                 description: "JSON string com opções do produto (cores, tamanhos, etc.)"
 *           encoding:
 *             files:
 *               contentType: image/*
 *               category_ids:
 *               style: form
 *               explode: true
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
 *                   examples:
 *                     name_required:
 *                       value: "Name is required"
 *                       summary: "Nome é obrigatório"
 *                     name_exists:
 *                       value: "Já existe um produto com este nome"
 *                       summary: "Nome já existe"
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token inválido"
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
 *         example: ""
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
 *     description: |
 *       Atualiza dados de um produto.
 *
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer # Ou string, se seu ID for string
 *         description: ID do produto a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             # Nenhum campo é explicitamente 'required' aqui, pois PUT pode ser usado para atualizações parciais.
 *             # Se algum campo for sempre necessário mesmo na atualização, adicione-o ao 'required' array.
 *             properties:
 *               name: # Mantido, pois está no seu exemplo
 *                 type: string
 *                 example: "Vestido Jeans Modelo - 10/2024"
 *               description: # Mantido
 *                 type: string
 *                 example: "Descrição da Bermuda Jeans Modelo - 2025"
 *               price: # Mantido
 *                 type: number
 *                 format: float
 *                 example: 350.9
 *               # Campos como enabled, slug, stock, price_with_discount foram removidos
 *               # do schema principal do requestBody para refletir seu exemplo.
 *               # Se eles PUDEREM ser enviados, eles devem ser adicionados aqui como opcionais.
 *               category_ids: # Mantido
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3]
 *                 description: "IDs das categorias associadas (substituem as existentes)"
 *               images: # Mantido
 *                 type: array
 *                 description: "Array de objetos de imagem. Substituem as existentes. Envie array vazio para remover todas."
 *                 items:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                       example: "/images/nova-imagem.png"
 *                     content:
 *                       type: string
 *                       format: byte
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
 *                 example: [] # Exemplo de como remover todas as imagens
 *               options: # Mantido
 *                 type: array
 *                 description: "Array de objetos de opção. Substituem as existentes. Envie array vazio para remover todas."
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Cor"
 *                     shape:
 *                       type: string
 *                       example: "square"
 *                     radius:
 *                       type: integer
 *                       example: 5
 *                     type:
 *                       type: string
 *                       example: "text"
 *                     values:
 *                       type: string
 *                       example: "[\"P\",\"M\",\"G\"]"
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *             example: # Exemplo principal que aparecerá no Swagger UI
 *               name: "Vestido Jeans Modelo - 10/2024"
 *               description: "Descrição da Bermuda Jeans Modelo - 2025"
 *               price: 350.9
 *               images: []
 *               options:
 *                 - id: 1
 *                   title: "Cor"
 *                   shape: "square"
 *                   radius: 5
 *                   type: "text"
 *                   values: "[\"P\",\"M\",\"G\"]"
 *                   product_id: 1
 *               category_ids: [3]
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               # A resposta DEVE refletir o estado completo e ATUALIZADO do recurso
 *               # Mesmo que o request tenha sido parcial.
 *               type: object
 *               properties:
 *                 id: # ID do produto
 *                   type: integer # Ou string
 *                   example: 3
 *                 enabled: # Assumindo que este campo ainda existe no modelo do produto
 *                   type: boolean
 *                   example: true
 *                 name:
 *                   type: string
 *                   example: "Calça Jeans - 10/2025"
 *                 slug: # Assumindo que este campo ainda existe
 *                   type: string
 *                   example: "calca-jeans-10-2025"
 *                 stock: # Assumindo que este campo ainda existe
 *                   type: integer
 *                   example: 15 # Valor atual no banco
 *                 description:
 *                   type: string
 *                   example: "Descrição da Bermuda Jeans Modelo - 2025"
 *                 price:
 *                   type: number
 *                   example: 189.99
 *                 price_with_discount: # Assumindo que este campo ainda existe
 *                   type: number
 *                   example: 120.00 # Valor atual no banco
 *                 category_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [3]
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       path:
 *                         type: string
 *                   example: [] # Se foram removidas no PUT
 *                 options:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Cor"
 *                       shape:
 *                         type: string
 *                         example: "square"
 *                       radius:
 *                         type: integer
 *                         example: 5
 *                       type:
 *                         type: string
 *                         example: "text"
 *                       values:
 *                         type: string
 *                         example: "[\"P\",\"M\",\"G\"]"
 *                       product_id:
 *                         type: integer
 *                         example: 1
 *       400:
 *         description: Dados inválidos
 *         # ... (schema da resposta de erro)
 *       404:
 *         description: Produto não encontrado
 *         # ... (schema da resposta de erro)
 *       500:
 *         description: Erro interno do servidor
 *         # ... (schema da resposta de erro)
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
