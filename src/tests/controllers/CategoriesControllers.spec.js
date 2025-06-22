const CategoryController = require("@controllers/CategoriesControllers");
const CategoryService = require("@services/CategoryService");
const categorySchema = require("@validations/categorySchema");

// Mock dos serviços e validação
jest.mock("@services/CategoryService");
jest.mock("@validations/categorySchema", () => ({
  validate: jest.fn(),
}));

// Helpers para mocks de req e res
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (query = {}, body = {}, params = {}) => ({
  query,
  body,
  params,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("CategoryController", () => {
  describe("search", () => {
    it("deve retornar categorias com paginação", async () => {
      const categories = [
        { id: 1, name: "Cat1", slug: "cat1", use_in_menu: true },
      ];
      CategoryService.searchCategories.mockResolvedValue({
        rows: categories,
        count: 1,
      });

      const req = mockReq({ limit: "10", page: "1" });
      const res = mockRes();

      await CategoryController.search(req, res);

      expect(CategoryService.searchCategories).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
          attributes: ["id", "name", "slug", "use_in_menu"],
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: categories,
        total: 1,
        limit: 10,
        page: 1,
      });
    });

    it("deve retornar erro 500 em caso de exceção", async () => {
      CategoryService.searchCategories.mockRejectedValue(new Error("Erro DB"));

      const req = mockReq();
      const res = mockRes();

      await CategoryController.search(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erro ao buscar categorias" })
      );
    });
  });

  describe("show", () => {
    it("deve retornar categoria pelo id", async () => {
      const category = { id: 1, name: "Cat1", slug: "cat1", use_in_menu: true };
      CategoryService.findCategoryById.mockResolvedValue(category);

      const req = mockReq({}, {}, { id: 1 });
      const res = mockRes();

      await CategoryController.show(req, res);

      expect(res.json).toHaveBeenCalledWith(category);
    });

    it("deve retornar 404 se categoria não existir", async () => {
      CategoryService.findCategoryById.mockResolvedValue(null);

      const req = mockReq({}, {}, { id: 99 });
      const res = mockRes();

      await CategoryController.show(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Categoria nao encontrada.",
      });
    });
  });

  describe("store", () => {
    it("deve criar categoria com sucesso", async () => {
      const body = { name: "Nova Cat", slug: "nova-cat", use_in_menu: true };

      categorySchema.validate.mockReturnValue({ error: null, value: body });

      const createdCategory = { id: 1, ...body };
      CategoryService.createCategory.mockResolvedValue(createdCategory);

      const req = mockReq({}, body);
      const res = mockRes();

      await CategoryController.store(req, res);

      expect(CategoryService.createCategory).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Categoria criada com sucesso!",
        category: createdCategory,
      });
    });

    it("deve retornar erro 400 se validação falhar", async () => {
      categorySchema.validate.mockReturnValue({
        error: {
          details: [
            { path: ["name"], type: "string.empty", message: "name is empty" },
          ],
        },
      });

      const req = mockReq({}, { name: "" });
      const res = mockRes();

      await CategoryController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Dados inválidos",
        details: ["name não pode estar vazio"],
      });
    });

    it("deve retornar erro 500 em exceção do service", async () => {
      categorySchema.validate.mockReturnValue({
        error: null,
        value: { name: "Ok" },
      });
      CategoryService.createCategory.mockRejectedValue(
        new Error("Erro interno")
      );

      const req = mockReq({}, { name: "Ok" });
      const res = mockRes();

      await CategoryController.store(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro interno do servidor",
        error: "Erro interno",
      });
    });
  });

  describe("update", () => {
    it("deve atualizar categoria com sucesso", async () => {
      const body = { name: "Atualizada" };
      categorySchema.validate.mockReturnValue({ error: null, value: body });

      const updatedCategory = {
        id: 1,
        name: "Atualizada",
        slug: "slug",
        use_in_menu: false,
      };
      CategoryService.updateCategory.mockResolvedValue(updatedCategory);

      const req = mockReq({}, body, { id: 1 });
      const res = mockRes();

      await CategoryController.update(req, res);

      expect(CategoryService.updateCategory).toHaveBeenCalledWith(1, body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Categoria atualizada com sucesso!",
        category: updatedCategory,
      });
    });

    it("deve retornar 404 se categoria não for encontrada", async () => {
      categorySchema.validate.mockReturnValue({
        error: null,
        value: { name: "Ok" },
      });
      CategoryService.updateCategory.mockResolvedValue(null);

      const req = mockReq({}, { name: "Ok" }, { id: 99 });
      const res = mockRes();

      await CategoryController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Categoria não encontrada.",
      });
    });

    it("deve retornar 400 se validação falhar", async () => {
      categorySchema.validate.mockReturnValue({
        error: {
          details: [
            { path: ["name"], type: "string.empty", message: "name is empty" },
          ],
        },
      });

      const req = mockReq({}, { name: "" }, { id: 1 });
      const res = mockRes();

      await CategoryController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Dados inválidos",
        details: ["name não pode estar vazio"],
      });
    });
  });

  describe("delete", () => {
    it("deve deletar categoria com sucesso", async () => {
      CategoryService.deleteCategory.mockResolvedValue(1);

      const req = mockReq({}, {}, { id: 1 });
      const res = mockRes();
      await CategoryController.delete(req, res);

      expect(CategoryService.deleteCategory).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Categoria deletada com sucesso.",
      });
    });

    it("deve retornar 404 se categoria não existir", async () => {
      CategoryService.deleteCategory.mockResolvedValue(0);

      const req = mockReq({}, {}, { id: 99 });
      const res = mockRes();

      await CategoryController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Categoria não encontrada.",
      });
    });

    it("deve retornar 500 em erro do service", async () => {
      CategoryService.deleteCategory.mockRejectedValue(new Error("Erro DB"));

      const req = mockReq({}, {}, { id: 1 });
      const res = mockRes();

      await CategoryController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erro ao deletar a categoria." })
      );
    });
  });
});
