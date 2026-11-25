import { beforeEach, expect, test, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { cadastrarCliente } from "../../src/modules/clientes/clientes.service.js";
import { ErroValidacao } from "../../src/errors/erro-validacao.js";
import { ErroEmailDuplicado } from "../../src/modules/clientes/clientes.errors.js";

vi.mock("../../src/modules/clientes/clientes.service.js", () => ({
  cadastrarCliente: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

test("Deve cadastrar cliente e responder com 201", async () => {
  const dados = {
    email: "ana@example.com",
    nome: "Ana",
    sobrenome: "Silva",
    senha: "0123456789abcdef".repeat(4),
  };

  const resultadoCadastro = {
    nome: "Ana",
    sobrenome: "Silva",
    numeroConta: "00000001",
  };

  vi.mocked(cadastrarCliente).mockResolvedValue(resultadoCadastro);

  const resposta = await request(app).post("/clientes").send(dados);

  expect(resposta.status).toBe(201);

  expect(resposta.body).toEqual({
    mensagem: "Cadastro realizado com sucesso.",
    dados: resultadoCadastro,
  });

  expect(cadastrarCliente).toHaveBeenCalledTimes(1);
  expect(cadastrarCliente).toHaveBeenCalledWith(dados);
});

test("Deve responder com 400 quando o service lançar erro de validação", async () => {
  const dados = {
    email: "ana@example.com",
    nome: "",
    sobrenome: "Silva",
    senha: "0123456789abcdef".repeat(4),
  };

  vi.mocked(cadastrarCliente).mockRejectedValue(
    new ErroValidacao("Nome é obrigatório e deve ser um texto."),
  );

  const resposta = await request(app).post("/clientes").send(dados);

  expect(resposta.status).toBe(400);

  expect(resposta.body).toEqual({
    mensagem: "Nome é obrigatório e deve ser um texto.",
  });

  expect(cadastrarCliente).toHaveBeenCalledTimes(1);
  expect(cadastrarCliente).toHaveBeenCalledWith(dados);
});

test("Deve responder com 409 quando o e-mail já estiver cadastrado", async () => {
  const dados = {
    email: "ana@example.com",
    nome: "Ana",
    sobrenome: "Silva",
    senha: "0123456789abcdef".repeat(4),
  };

  vi.mocked(cadastrarCliente).mockRejectedValue(new ErroEmailDuplicado());

  const resposta = await request(app).post("/clientes").send(dados);

  expect(resposta.status).toBe(409);

  expect(resposta.body).toEqual({
    mensagem: "E-mail já cadastrado.",
  });

  expect(cadastrarCliente).toHaveBeenCalledTimes(1);
  expect(cadastrarCliente).toHaveBeenCalledWith(dados);
});

test("Deve responder com 500 sem expor detalhes de erros inesperados", async () => {
  const dados = {
    email: "ana@example.com",
    nome: "Ana",
    sobrenome: "Silva",
    senha: "0123456789abcdef".repeat(4),
  };

  vi.mocked(cadastrarCliente).mockRejectedValue(
    new Error("Detalhe interno fictício"),
  );

  const resposta = await request(app).post("/clientes").send(dados);

  expect(resposta.status).toBe(500);

  expect(resposta.body).toEqual({
    mensagem: "Não foi possível concluir o cadastro.",
  });

  expect(cadastrarCliente).toHaveBeenCalledTimes(1);
  expect(cadastrarCliente).toHaveBeenCalledWith(dados);
});

test("Deve responder com 400 em JSON sem chamar o service quando o corpo contiver JSON malformado", async () => {
  const resposta = await request(app)
    .post("/clientes")
    .set("Content-Type", "application/json")
    .send('{"nome":');

  expect(resposta.status).toBe(400);

  expect(resposta.headers["content-type"]).toMatch(/application\/json/);

  expect(resposta.body).toEqual({
    mensagem: "O corpo da requisição deve conter um JSON válido.",
  });

  expect(cadastrarCliente).not.toHaveBeenCalled();
});
