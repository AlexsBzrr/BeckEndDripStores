const ClienteController = require("@controllers/ClienteControllers");
const ClienteService = require("@services/ClienteService");

jest.mock("@services/ClienteService");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe("ClienteController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("index", () => {
    it("deve retornar lista de clientes com sucesso", async () => {
      const clientes = [{ id: 1, nome: "João" }];
      ClienteService.listClientes.mockResolvedValue(clientes);

      const req = {};
      const res = mockRes();

      await ClienteController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Clientes encontrados com sucesso",
        data: clientes,
      });
    });

    it("deve retornar mensagem se não houver clientes", async () => {
      ClienteService.listClientes.mockResolvedValue([]);

      const req = {};
      const res = mockRes();

      await ClienteController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nenhum cliente encontrado",
        data: [],
      });
    });
  });

  describe("show", () => {
    it("deve retornar cliente por ID", async () => {
      const cliente = { id: 1, nome: "João", email: "joao@email.com" };
      ClienteService.findClienteById.mockResolvedValue(cliente);

      const req = { params: { id: 1 } };
      const res = mockRes();

      await ClienteController.show(req, res);

      expect(ClienteService.findClienteById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Cliente encontrado com sucesso",
          data: expect.objectContaining({
            id: 1,
            nome: "João",
            email: "joao@email.com",
          }),
        })
      );
    });

    it("deve retornar erro 404 se cliente não for encontrado", async () => {
      ClienteService.findClienteById.mockResolvedValue(null);

      const req = { params: { id: 99 } };
      const res = mockRes();

      await ClienteController.show(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Cliente não encontrado",
      });
    });
  });

  describe("store", () => {
    it("deve criar cliente com sucesso", async () => {
      const req = {
        body: {
          nome: "Maria",
          email: "maria@email.com",
          cpf: "12345678900",
          telefone: "12345678",
          endereco: "Rua A",
          bairro: "Centro",
          cidade: "Cidade",
          cep: "12345678",
          complemento: "Apto 1",
          password: "senha123",
        },
      };

      const clienteCriado = { id: 1, ...req.body };

      ClienteService.createCliente.mockResolvedValue(clienteCriado);

      const res = mockRes();

      await ClienteController.store(req, res);

      expect(ClienteService.createCliente).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente criado com sucesso",
        data: clienteCriado,
      });
    });

    it("deve retornar erro 400 em falha de criação", async () => {
      ClienteService.createCliente.mockRejectedValue(new Error("Erro"));

      const req = { body: {} };
      const res = mockRes();

      await ClienteController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao criar cliente",
        message: "Erro",
      });
    });
  });

  describe("update", () => {
    it("deve atualizar cliente com sucesso", async () => {
      const req = {
        params: { id: 1 },
        body: { nome: "Atualizado" },
      };

      const clienteAtualizado = { id: 1, nome: "Atualizado" };
      ClienteService.updateCliente.mockResolvedValue(clienteAtualizado);

      const res = mockRes();

      await ClienteController.update(req, res);

      expect(ClienteService.updateCliente).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente atualizado com sucesso",
        data: clienteAtualizado,
      });
    });

    it("deve retornar erro 404 se cliente não for encontrado", async () => {
      ClienteService.updateCliente.mockRejectedValue(
        new Error("Cliente não encontrado")
      );

      const req = { params: { id: 1 }, body: {} };
      const res = mockRes();

      await ClienteController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao atualizar cliente",
        message: "Cliente não encontrado",
      });
    });
  });

  describe("delete", () => {
    it("deve deletar cliente com sucesso", async () => {
      ClienteService.deleteCliente.mockResolvedValue({
        message: "Cliente deletado com sucesso",
      });

      const req = { params: { id: 1 } };
      const res = mockRes();

      await ClienteController.delete(req, res);

      expect(ClienteService.deleteCliente).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cliente deletado com sucesso",
      });
    });

    it("deve retornar erro 404 se cliente não for encontrado", async () => {
      ClienteService.deleteCliente.mockRejectedValue(
        new Error("Cliente não encontrado")
      );

      const req = { params: { id: 99 } };
      const res = mockRes();

      await ClienteController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao deletar cliente",
        message: "Cliente não encontrado",
      });
    });
  });
});
