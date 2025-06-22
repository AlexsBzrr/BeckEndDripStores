const authController = require("@controllers/LoginControllers");
const User = require("@models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Mocks
jest.mock("@models/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthController - login", () => {
  const mockReq = (body) => ({ body });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("deve logar com sucesso com email e senha corretos", async () => {
    const req = mockReq({ email: "teste@email.com", password: "123456" });
    const res = mockRes();

    const userFromDb = {
      id: 1,
      firstname: "Alex",
      surname: "Silva",
      email: "teste@email.com",
      password: "hashed-password",
    };

    User.findOne.mockImplementation(({ where }) => {
      if (where.email) return Promise.resolve(userFromDb);
      if (where.id)
        return Promise.resolve({ ...userFromDb, createdAt: new Date() });
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-jwt-token");

    await authController.login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: req.body.email },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed-password");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usuário logado com sucesso!",
      token: "fake-jwt-token",
    });
  });

  it("deve retornar erro se email ou senha forem inválidos", async () => {
    const req = mockReq({
      email: "email@invalido.com",
      password: "senhaerrada",
    });
    const res = mockRes();

    User.findOne.mockResolvedValue(null);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email ou senha incorretos",
    });
  });

  it("deve retornar erro 400 se email ou senha estiverem ausentes", async () => {
    const req = mockReq({ email: "", password: "" });
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email e senha são obrigatórios",
    });
  });

  it("deve tratar erro interno e retornar status 500", async () => {
    const req = mockReq({ email: "erro@email.com", password: "123456" });
    const res = mockRes();

    User.findOne.mockRejectedValue(new Error("Falha no banco de dados"));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Erro interno do servidor",
        error: "Falha no banco de dados",
      })
    );
  });
});
