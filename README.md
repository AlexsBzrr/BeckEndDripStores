# DripStores Backend

Uma API REST completa para e-commerce desenvolvida com Node.js, Express e MySQL, focada em gestão de produtos, usuários e categorias para uma loja online.

## 🚀 Tecnologias Utilizadas

### Core

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **MySQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js

### Autenticação & Segurança

- **JWT (jsonwebtoken)** - Autenticação baseada em tokens
- **bcrypt** - Hash de senhas
- **cors** - Controle de acesso CORS

### Validação & Upload

- **Joi** - Validação de schemas
- **Multer** - Upload de arquivos/imagens

### Documentação

- **Swagger (swagger-jsdoc & swagger-ui-express)** - Documentação automática da API

### Desenvolvimento

- **Nodemon** - Auto-restart do servidor
- **dotenv** - Gerenciamento de variáveis de ambiente
- **Sequelize CLI** - Interface de linha de comando para migrations

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações do banco de dados
├── controllers/      # Controladores das rotas
├── database/         # Configuração e migrations do banco
│   ├── migrations/   # Scripts de migração
│   └── seeders/      # Dados iniciais
├── docs/            # Documentação Swagger
├── middlewares/     # Middlewares personalizados
│   ├── auth.js      # Autenticação JWT
│   ├── authenticateToken.js
│   └── upload.js    # Upload de arquivos
├── models/          # Modelos Sequelize
│   ├── category.js
│   ├── client.js
│   ├── images.js
│   ├── login.js
│   ├── loginClients.js
│   ├── options.js
│   ├── product.js
│   ├── productCategory.js
│   └── user.js
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
│   ├── CategoryService.js
│   ├── ClientsService.js
│   └── UserService.js
├── uploads/         # Arquivos enviados
└── validations/     # Schemas de validação
    ├── updateProductSchema.js
    └── userValidation.js
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL
- Git

### Passos para instalação

1. **Clone o repositório**

```bash
git clone https://github.com/AlexsBzrr/BeckEndDripStores.git
cd BeckEndDripStores
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=dripstores
JWT_SECRET=sua_chave_secreta
PORT=3000
```

4. **Execute as migrations**

```bash
npx sequelize-cli db:migrate
```

5. **Execute os seeders (opcional)**

```bash
npx sequelize-cli db:seed:all
```

6. **Inicie o servidor**

```bash
# Desenvolvimento
npm start

# Produção
npm run prod
```

## 📋 Principais Rotas da API

### Autenticação

- `POST /api/auth/login` - Login de usuários
- `POST /api/auth/register` - Registro de novos usuários
- `POST /api/auth/clients/login` - Login de clientes
- `POST /api/auth/clients/register` - Registro de clientes

### Usuários

- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Produtos

- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Categorias

- `GET /api/categories` - Listar categorias
- `GET /api/categories/:id` - Buscar categoria por ID
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Deletar categoria

### Clientes

- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente por ID
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

### Upload de Imagens

- `POST /api/upload` - Upload de imagens de produtos

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login bem-sucedido, inclua o token no cabeçalho das requisições:

```
Authorization: Bearer seu_token_jwt
```

## 📖 Documentação da API

A documentação completa da API está disponível via Swagger UI quando o servidor estiver rodando:

```
http://localhost:3300/api-docs
```

## 🗃️ Banco de Dados

### Principais Tabelas

- **users** - Usuários administradores
- **clients** - Clientes da loja
- **products** - Produtos disponíveis
- **categories** - Categorias de produtos
- **product_categories** - Relacionamento produto-categoria
- **images** - Imagens dos produtos
- **options** - Opções/variações dos produtos

### Relacionamentos

- Produtos podem ter múltiplas categorias (N:N)
- Produtos podem ter múltiplas imagens (1:N)
- Produtos podem ter múltiplas opções (1:N)

## 🚀 Scripts Disponíveis

- `npm start` - Inicia o servidor em modo desenvolvimento com nodemon
- `npm run prod` - Inicia o servidor em modo produção
- `npx sequelize-cli db:migrate` - Executa as migrations
- `npx sequelize-cli db:seed:all` - Executa os seeders

## 🔧 Middlewares

### Autenticação

- Verificação de tokens JWT
- Proteção de rotas sensíveis

### Upload

- Configuração do Multer para upload de imagens
- Validação de tipos de arquivo
- Controle de tamanho de arquivo

### Validação

- Schemas Joi para validação de dados
- Sanitização de entrada

## 📝 Exemplo de Uso

### Criando um produto

```javascript
const response = await fetch("/api/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer seu_token",
  },
  body: JSON.stringify({
    name: "Produto Exemplo",
    description: "Descrição do produto",
    price: 99.9,
    enabled: true,
    use_in_menu: true,
  }),
});
```

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 📧 Contato

- Repositório: [https://github.com/AlexsBzrr/BeckEndDripStores](https://github.com/AlexsBzrr/BeckEndDripStores)
- Issues: [https://github.com/AlexsBzrr/BeckEndDripStores/issues](https://github.com/AlexsBzrr/BeckEndDripStores/issues)

---

⭐ Se este projeto te ajudou, não esqueça de dar uma estrela no repositório!
