import { test, expect, beforeEach, vi } from "vitest";
import * as argon2 from "argon2";
import { registrarCliente } from "../../src/modules/clientes/clientes.repository.js";
import { cadastrarCliente } from "../../src/modules/clientes/clientes.service.js";
import type { DadosCadastroCliente } from "../../src/modules/clientes/clientes.types.js";

function criarDadosCliente() {
  return {
    email: "ana@example.com",
    nome: "Ana",
    sobrenome: "Silva",
    senha: "0123456789abcdef".repeat(4),
  };
}

vi.mock("../../src/modules/clientes/clientes.repository.js", () => ({
  registrarCliente: vi.fn(),
}));

vi.mock("argon2", () => ({
  hash: vi.fn(),
  argon2id: 2,
}));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(argon2.hash).mockResolvedValue("hash-ficticio");

  vi.mocked(registrarCliente).mockResolvedValue({
    nome: "Ana",
    sobrenome: "Silva",
    numeroConta: "00000001",
  });
});

// Sucesso e preparação dos dados

test("Deve cadastrar com dados válidos.", async () => {
  const cliente = criarDadosCliente();

  const resultado = await cadastrarCliente(cliente);

  expect(resultado).toEqual({
    nome: cliente.nome,
    sobrenome: cliente.sobrenome,
    numeroConta: "00000001",
  });

  expect(argon2.hash).toHaveBeenCalledTimes(1);
  expect(registrarCliente).toHaveBeenCalledTimes(1);

  expect(argon2.hash).toHaveBeenCalledWith(cliente.senha, {
    type: argon2.argon2id,
  });
  expect(registrarCliente).toHaveBeenCalledWith({
    email: cliente.email,
    nome: cliente.nome,
    sobrenome: cliente.sobrenome,
    senhaHash: "hash-ficticio",
  });
});

test("Deve normalizar o e-mail", async () => {
  const cliente = criarDadosCliente();
  cliente.email = " Ana@Example.Com ";

  await cadastrarCliente(cliente);

  expect(registrarCliente).toHaveBeenCalledWith(
    expect.objectContaining({
      email: "ana@example.com",
    }),
  );
});

test("Deve remover espaços das extremidades de nome e sobrenome", async () => {
  const cliente = criarDadosCliente();
  cliente.nome = " Ana Maria ";
  cliente.sobrenome = " da Silva ";

  await cadastrarCliente(cliente);

  expect(registrarCliente).toHaveBeenCalledWith(
    expect.objectContaining({
      nome: "Ana Maria",
      sobrenome: "da Silva",
    }),
  );
});

test("Deve aceitar uma credencial hexadecimal de 64 caracteres com letras maiúsculas.", async () => {
  const cliente = criarDadosCliente();
  cliente.senha = "0123456789ABCDEF".repeat(4);

  await cadastrarCliente(cliente);

  expect(argon2.hash).toHaveBeenCalledWith(cliente.senha, {
    type: argon2.argon2id,
  });

  expect(registrarCliente).toHaveBeenCalled();
});

// Entrada e campos obrigatórios

test.each([
  { caso: "undefined", entrada: undefined },
  { caso: "null", entrada: null },
  { caso: "array", entrada: [] },
  { caso: "string", entrada: "texto" },
  { caso: "número", entrada: 123 },
  { caso: "booleano", entrada: true },
])("Deve rejeitar cadastro recebido como $caso", async ({ entrada }) => {
  await expect(
    cadastrarCliente(entrada as unknown as DadosCadastroCliente),
  ).rejects.toThrow("Os dados do cadastro devem ser um objeto.");

  expect(argon2.hash).not.toHaveBeenCalled();
  expect(registrarCliente).not.toHaveBeenCalled();
});

test.each([
  {
    campo: "email",
    valor: "",
    caso: "vazio",
    mensagem: "E-mail é obrigatório e deve ser um texto.",
  },
  {
    campo: "email",
    valor: "   ",
    caso: "somente com espaços",
    mensagem: "E-mail é obrigatório e deve ser um texto.",
  },
  {
    campo: "nome",
    valor: "",
    caso: "vazio",
    mensagem: "Nome é obrigatório e deve ser um texto.",
  },
  {
    campo: "nome",
    valor: "   ",
    caso: "somente com espaços",
    mensagem: "Nome é obrigatório e deve ser um texto.",
  },
  {
    campo: "sobrenome",
    valor: "",
    caso: "vazio",
    mensagem: "Sobrenome é obrigatório e deve ser um texto.",
  },
  {
    campo: "sobrenome",
    valor: "   ",
    caso: "somente com espaços",
    mensagem: "Sobrenome é obrigatório e deve ser um texto.",
  },
  {
    campo: "senha",
    valor: "",
    caso: "vazio",
    mensagem: "A credencial deve conter exatamente 64 caracteres hexadecimais.",
  },
  {
    campo: "senha",
    valor: "   ",
    caso: "somente com espaços",
    mensagem: "A credencial deve conter exatamente 64 caracteres hexadecimais.",
  },
] as const)(
  "Deve rejeitar $campo $caso",
  async ({ campo, valor, mensagem }) => {
    const cliente = criarDadosCliente();
    cliente[campo] = valor;

    await expect(cadastrarCliente(cliente)).rejects.toThrow(mensagem);

    expect(argon2.hash).not.toHaveBeenCalled();
    expect(registrarCliente).not.toHaveBeenCalled();
  },
);

test.each([
  {
    campo: "email",
    valor: 1,
    caso: "com número",
    mensagem: "E-mail é obrigatório e deve ser um texto.",
  },
  {
    campo: "nome",
    valor: true,
    caso: "com booleano",
    mensagem: "Nome é obrigatório e deve ser um texto.",
  },
  {
    campo: "sobrenome",
    valor: null,
    caso: "com null",
    mensagem: "Sobrenome é obrigatório e deve ser um texto.",
  },
  {
    campo: "senha",
    valor: undefined,
    caso: "com undefined",
    mensagem: "A credencial deve conter exatamente 64 caracteres hexadecimais.",
  },
] as const)(
  "Deve rejeitar campos com tipos diferentes de string. Ex.: $campo $caso",
  async ({ campo, valor, mensagem }) => {
    const cliente = {
      ...criarDadosCliente(),
      [campo]: valor,
    };

    await expect(
      cadastrarCliente(cliente as unknown as DadosCadastroCliente),
    ).rejects.toThrow(mensagem);

    expect(argon2.hash).not.toHaveBeenCalled();
    expect(registrarCliente).not.toHaveBeenCalled();
  },
);

// Limites

test.each([
  {
    campo: "email",
    valor: "a".repeat(242) + "@example.com",
    limite: 254,
  },
  {
    campo: "nome",
    valor: "a".repeat(80),
    limite: 80,
  },
  {
    campo: "sobrenome",
    valor: "a".repeat(150),
    limite: 150,
  },
] as const)(
  "Deve aceitar $campo com $limite caracteres.",
  async ({ campo, valor }) => {
    const cliente = {
      ...criarDadosCliente(),
      [campo]: valor,
    };

    await cadastrarCliente(cliente);

    expect(argon2.hash).toHaveBeenCalled();
    expect(registrarCliente).toHaveBeenCalled();

    expect(registrarCliente).toHaveBeenCalledWith(
      expect.objectContaining({
        [campo]: valor,
      }),
    );
  },
);

test.each([
  {
    campo: "email",
    valor: "a".repeat(243) + "@example.com",
    tamanho: 255,
    mensagem: "E-mail deve ter no máximo 254 caracteres.",
  },
  {
    campo: "nome",
    valor: "a".repeat(81),
    tamanho: 81,
    mensagem: "Nome deve ter no máximo 80 caracteres.",
  },
  {
    campo: "sobrenome",
    valor: "a".repeat(151),
    tamanho: 151,
    mensagem: "Sobrenome deve ter no máximo 150 caracteres.",
  },
  {
    campo: "senha",
    valor: "a".repeat(63),
    tamanho: 63,
    mensagem: "A credencial deve conter exatamente 64 caracteres hexadecimais.",
  },
  {
    campo: "senha",
    valor: "a".repeat(65),
    tamanho: 65,
    mensagem: "A credencial deve conter exatamente 64 caracteres hexadecimais.",
  },
] as const)(
  "Deve rejeitar $campo com $tamanho caracteres.",
  async ({ campo, valor, mensagem }) => {
    const cliente = {
      ...criarDadosCliente(),
      [campo]: valor,
    };

    await expect(cadastrarCliente(cliente)).rejects.toThrow(mensagem);

    expect(argon2.hash).not.toHaveBeenCalled();
    expect(registrarCliente).not.toHaveBeenCalled();
  },
);

// Formatos

test.each([
  { caso: "sem arroba", email: "anaexample.com" },
  { caso: "sem parte antes da arroba", email: "@example.com" },
  { caso: "sem ponto no domínio", email: "ana@example" },
  { caso: "com múltiplas arrobas", email: "ana@@example.com" },
  { caso: "com espaços internos", email: "ana silva@example.com" },
])("Deve rejeitar e-mail $caso", async ({ email }) => {
  const cliente = criarDadosCliente();
  cliente.email = email;

  await expect(cadastrarCliente(cliente)).rejects.toThrow("E-mail inválido.");

  expect(argon2.hash).not.toHaveBeenCalled();
  expect(registrarCliente).not.toHaveBeenCalled();
});

test.each([
  {
    caso: "com caractere não hexadecimal",
    senha: "a".repeat(63) + "g",
  },
  {
    caso: "com espaço no início",
    senha: " " + "a".repeat(64),
  },
  {
    caso: "com espaço no fim",
    senha: "a".repeat(64) + " ",
  },
  {
    caso: "com espaço interno",
    senha: "a".repeat(31) + " " + "a".repeat(32),
  },
])("Deve rejeitar credencial $caso", async ({ senha }) => {
  const cliente = criarDadosCliente();
  cliente.senha = senha;

  await expect(cadastrarCliente(cliente)).rejects.toThrow(
    "A credencial deve conter exatamente 64 caracteres hexadecimais.",
  );

  expect(argon2.hash).not.toHaveBeenCalled();
  expect(registrarCliente).not.toHaveBeenCalled();
});

// Falhas das dependências

test("Deve propagar o erro do Argon2 sem chamar o repository", async () => {
  const cliente = criarDadosCliente();
  const erro = new Error("Falha simulada ao gerar hash");

  vi.mocked(argon2.hash).mockRejectedValue(erro);

  await expect(cadastrarCliente(cliente)).rejects.toBe(erro);

  expect(argon2.hash).toHaveBeenCalledTimes(1);
  expect(argon2.hash).toHaveBeenCalledWith(cliente.senha, {
    type: argon2.argon2id,
  });
  expect(registrarCliente).not.toHaveBeenCalled();
});

test("Deve propagar o erro do repository", async () => {
  const cliente = criarDadosCliente();
  const erro = new Error("Falha simulada ao cadastrar no repository");

  vi.mocked(registrarCliente).mockRejectedValue(erro);

  await expect(cadastrarCliente(cliente)).rejects.toBe(erro);

  expect(argon2.hash).toHaveBeenCalledTimes(1);
  expect(registrarCliente).toHaveBeenCalledTimes(1);
  expect(registrarCliente).toHaveBeenCalledWith({
    email: cliente.email,
    nome: cliente.nome,
    sobrenome: cliente.sobrenome,
    senhaHash: "hash-ficticio",
  });
});
