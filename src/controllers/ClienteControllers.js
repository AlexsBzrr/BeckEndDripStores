const ClienteService = require("../services/ClienteService");

module.exports = {
  async index(req, res) {
    try {
      const clientes = await ClienteService.listClientes();

      if (!clientes.length) {
        return res.status(200).json({
          message: "Nenhum cliente encontrado",
          data: [],
        });
      }

      return res.status(200).json({
        message: "Clientes encontrados com sucesso",
        data: clientes,
      });
    } catch (error) {
      console.error("Erro no controller index:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        message: error.message,
      });
    }
  },

  async show(req, res) {
    try {
      const cliente = await ClienteService.findClienteById(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          error: "Cliente não encontrado",
        });
      }

      return res.status(200).json({
        message: "Cliente encontrado com sucesso",
        data: {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          cpf: cliente.cpf,
          telefone: cliente.telefone,
          endereco: cliente.endereco,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          cep: cliente.cep,
          complemento: cliente.complemento,
        },
      });
    } catch (error) {
      console.error("Erro no controller show:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        message: error.message,
      });
    }
  },

  async store(req, res) {
    try {
      const {
        nome,
        email,
        cpf,
        telefone,
        endereco,
        bairro,
        cidade,
        cep,
        complemento,
        password,
      } = req.body;

      const cliente = await ClienteService.createCliente({
        nome,
        email,
        cpf,
        telefone,
        endereco,
        bairro,
        cidade,
        cep,
        complemento,
        password,
      });

      return res.status(201).json({
        message: "Cliente criado com sucesso",
        data: cliente,
      });
    } catch (error) {
      console.error("Erro no controller store:", error);
      return res.status(400).json({
        error: "Erro ao criar cliente",
        message: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        email,
        cpf,
        telefone,
        endereco,
        bairro,
        cidade,
        cep,
        complemento,
        password,
      } = req.body;

      const cliente = await ClienteService.updateCliente(id, {
        nome,
        email,
        cpf,
        telefone,
        endereco,
        bairro,
        cidade,
        cep,
        complemento,
        password,
      });

      return res.status(200).json({
        message: "Cliente atualizado com sucesso",
        data: cliente,
      });
    } catch (error) {
      console.error("Erro no controller update:", error);
      const status = error.message === "Cliente não encontrado" ? 404 : 400;
      return res.status(status).json({
        error: "Erro ao atualizar cliente",
        message: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ClienteService.deleteCliente(id);

      return res.status(200).json({
        message: resultado.message,
      });
    } catch (error) {
      console.error("Erro no controller delete:", error);
      const status = error.message === "Cliente não encontrado" ? 404 : 500;
      return res.status(status).json({
        error: "Erro ao deletar cliente",
        message: error.message,
      });
    }
  },
};
