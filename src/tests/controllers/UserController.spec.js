const userController = require("@controllers/UserControllers");
const UserService = require("@services/UserService");
const { generateToken } = require("@controllers/LoginControllers");
const userSchema = require("@validations/userValidation");

// Mocks
jest.mock("@services/UserService");
jest.mock("@controllers/LoginControllers", () => ({
  generateToken: jest.fn(),
}));
jest.mock("@validations/userValidation", () => ({
  validate: jest.fn(),
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (body = {}, params = {}) => ({ body, params });
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("User Controller", () => {
  describe("index", () => {
    it("deve retornar lista de usuários", async () => {
      const users = [
        { id: 1, firstname: "Alex", surname: "Silva", email: "alex@email.com" },
      ];
      UserService.listUsers.mockResolvedValue(users);

      const res = mockRes();
      await userController.index({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuários encontrados com sucesso",
        users: [
          {
            id: 1,
            firstname: "Alex",
            surname: "Silva",
            email: "alex@email.com",
          },
        ],
      });
    });

    it("deve retornar mensagem caso nenhum usuário exista", async () => {
      UserService.listUsers.mockResolvedValue([]);

      const res = mockRes();
      await userController.index({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("Nenhum usuário cadastrado");
    });

    it("deve retornar erro 500 em caso de exceção", async () => {
      UserService.listUsers.mockRejectedValue(new Error("Falha"));

      const res = mockRes();
      await userController.index({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao buscar usuários",
      });
    });
  });

  describe("show", () => {
    it("deve retornar dados do usuário por ID", async () => {
      const user = { firstname: "Alex", surname: "Silva", email: "a@a.com" };
      UserService.findUserById.mockResolvedValue(user);

      const res = mockRes();
      const req = mockReq({}, { id: 1 });
      await userController.show(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("deve retornar 404 se usuário não for encontrado", async () => {
      UserService.findUserById.mockResolvedValue(null);

      const res = mockRes();
      const req = mockReq({}, { id: 2 });
      await userController.show(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário nao encontrado",
      });
    });
  });

  describe("store", () => {
    it("deve criar usuário com sucesso", async () => {
      const reqBody = {
        firstname: "João",
        surname: "Souza",
        email: "joao@email.com",
        password: "123456",
        confirmPassword: "123456",
      };

      const userCreated = {
        id: 1,
        firstname: "João",
        surname: "Souza",
        email: "joao@email.com",
      };

      userSchema.validate.mockReturnValue({ error: null, value: reqBody });
      UserService.createUser.mockResolvedValue(userCreated);
      generateToken.mockReturnValue("token-fake");

      const res = mockRes();
      const req = mockReq(reqBody);
      await userController.store(req, res);

      expect(UserService.createUser).toHaveBeenCalledWith({
        firstname: "João",
        surname: "Souza",
        email: "joao@email.com",
        password: "123456",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário criado com sucesso!",
        user: userCreated,
        token: "token-fake",
      });
    });

    it("deve retornar erro 400 se a validação falhar", async () => {
      userSchema.validate.mockReturnValue({
        error: { details: [{ message: "Email inválido" }] },
      });

      const res = mockRes();
      const req = mockReq({ email: "invalido" });
      await userController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro de validação",
        error: "Email inválido",
      });
    });

    it("deve retornar erro 400 se criação falhar", async () => {
      userSchema.validate.mockReturnValue({
        error: null,
        value: { email: "ok" },
      });
      UserService.createUser.mockRejectedValue(new Error("DB error"));

      const res = mockRes();
      const req = mockReq({ email: "ok" });
      await userController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao criar usuário",
        error: "DB error",
      });
    });
  });

  describe("update", () => {
    it("deve atualizar usuário", async () => {
      const user = {
        firstname: "Novo",
        surname: "Nome",
        email: "novo@email.com",
      };
      UserService.updateUser.mockResolvedValue(user);

      const res = mockRes();
      const req = mockReq({ firstname: "Novo" }, { id: 1 });
      await userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário atualizado com sucesso!",
        user,
      });
    });

    it("deve retornar 404 se usuário não for encontrado para atualização", async () => {
      UserService.updateUser.mockResolvedValue(null);

      const res = mockRes();
      const req = mockReq({}, { id: 1 });
      await userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário nao encontrado",
      });
    });
  });

  describe("delete", () => {
    it("deve deletar usuário com sucesso", async () => {
      UserService.findUserById.mockResolvedValue({ id: 1 });
      UserService.deleteUser.mockResolvedValue();

      const res = mockRes();
      const req = mockReq({}, { id: 1 });
      await userController.delete(req, res);

      expect(UserService.deleteUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário deletado com sucesso!",
      });
    });

    it("deve retornar 404 se usuário não for encontrado", async () => {
      UserService.findUserById.mockResolvedValue(null);

      const res = mockRes();
      const req = mockReq({}, { id: 99 });
      await userController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário nao encontrado",
      });
    });
  });
});
