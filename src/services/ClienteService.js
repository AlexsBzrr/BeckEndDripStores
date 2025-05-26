const bcrypt = require("bcrypt");
const Cliente = require("../models/Cliente");

const ClienteService = {
  async listClientes() {
    try {
      return await Cliente.findAll();
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      throw error;
    }
  },

  async findClienteById(id) {
    try {
      return await Cliente.findByPk(id);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      throw error;
    }
  },

  async createCliente({
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
  }) {
    try {
      let clienteData = {
        nome,
        email,
        cpf,
        telefone,
        endereco,
        bairro,
        cidade,
        cep,
        complemento,
      };

      // Se password for fornecido, fazer hash
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        clienteData.password = hash;
      }

      return await Cliente.create(clienteData);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  },

  async updateCliente(
    id,
    {
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
    }
  ) {
    try {
      let updateData = {
        nome,
        email,
        cpf,
        telefone,
        endereco,
        bairro,
        cidade,
        cep,
        complemento,
      };

      // Se password for fornecido, fazer hash
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        updateData.password = hash;
      }

      const [affectedRows] = await Cliente.update(updateData, {
        where: { id },
      });

      if (affectedRows === 0) {
        throw new Error("Cliente não encontrado");
      }

      return await this.findClienteById(id);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
  },

  async deleteCliente(id) {
    try {
      const affectedRows = await Cliente.destroy({ where: { id } });

      if (affectedRows === 0) {
        throw new Error("Cliente não encontrado");
      }

      return { message: "Cliente deletado com sucesso" };
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      throw error;
    }
  },
};

module.exports = ClienteService;
