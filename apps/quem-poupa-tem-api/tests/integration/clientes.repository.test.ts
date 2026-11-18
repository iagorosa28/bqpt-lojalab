import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { pool } from "../../src/db/pool.js";
import { registrarCliente } from "../../src/modules/clientes/clientes.repository.js";

function criarDadosCliente() {
  return {
    email: "ana@example.com",
    nome: "Ana",
    sobrenome: "Silva",
    senhaHash: "hash-ficticio-para-teste",
  };
}

let bancoDeTesteConfirmado = false;

beforeAll(async () => {
  expect(process.env.DB_NAME).toBe("quem_poupa_tem_test");

  const resultado = await pool.query<{ banco: string }>(
    "SELECT current_database() AS banco",
  );

  expect(resultado.rows[0].banco).toBe("quem_poupa_tem_test");

  bancoDeTesteConfirmado = true;
});

afterEach(async () => {
  if (!bancoDeTesteConfirmado) return;

  const { email } = criarDadosCliente();

  await pool.query(
    `DELETE FROM contas
     USING clientes
     WHERE contas.cliente_id = clientes.id
       AND clientes.email = $1`,
    [email],
  );

  await pool.query("DELETE FROM clientes WHERE email = $1", [email]);
});

afterAll(async () => {
  await pool.end();
});

test("Deve cadastrar cliente e conta, conferindo o retorno e os dados persistidos.", async () => {
  const dados = criarDadosCliente();

  const resultado = await registrarCliente(dados);

  expect(resultado).toMatchObject({
    nome: dados.nome,
    sobrenome: dados.sobrenome,
  });
  expect(resultado.numeroConta).toMatch(/^[0-9]{8}$/);

  const consultaCliente = await pool.query(
    "SELECT id, email, nome, sobrenome, senha_hash FROM clientes WHERE email = $1",
    [dados.email],
  );

  expect(consultaCliente.rows).toHaveLength(1);

  const cliente = consultaCliente.rows[0];

  expect(cliente).toMatchObject({
    email: dados.email,
    nome: dados.nome,
    sobrenome: dados.sobrenome,
    senha_hash: dados.senhaHash,
  });

  const consultaConta = await pool.query(
    "SELECT cliente_id, numero_conta, saldo, criado_em FROM contas WHERE cliente_id = $1",
    [cliente.id],
  );

  expect(consultaConta.rows).toHaveLength(1);

  const conta = consultaConta.rows[0];

  expect(conta).toMatchObject({
    cliente_id: cliente.id,
    numero_conta: resultado.numeroConta,
    saldo: "0.00",
  });

  expect(conta.criado_em).toBeInstanceOf(Date);
  expect(Number.isNaN(conta.criado_em.getTime())).toBe(false);
});

test("Deve rejeitar email duplicado e preservar o cadastro original.", async () => {
  const dados = criarDadosCliente();

  const resultado = await registrarCliente(dados);

  await expect(registrarCliente(dados)).rejects.toMatchObject({
    code: "23505", // Violação de unicidade
  });

  const consultaId = await pool.query(
    "SELECT id FROM clientes WHERE email = $1",
    [dados.email],
  );

  expect(consultaId.rows).toHaveLength(1);

  const cliente = consultaId.rows[0];

  const consultaNumeroConta = await pool.query(
    "SELECT numero_conta FROM contas WHERE cliente_id = $1",
    [cliente.id],
  );

  expect(consultaNumeroConta.rows).toHaveLength(1);

  const conta = consultaNumeroConta.rows[0];

  expect(conta).toMatchObject({
    numero_conta: resultado.numeroConta,
  });
});

test("Deve desfazer a criação do cliente quando a criação da conta falhar.", async () => {
  const dados = criarDadosCliente();

  const consultaAntes = await pool.query<{ total: string }>(
    "SELECT COUNT(*) AS total FROM contas",
  );

  const totalAntes = consultaAntes.rows[0].total;

  await pool.query(`
    ALTER TABLE contas
    ADD CONSTRAINT contas_falha_provocada_teste
    CHECK (FALSE) NOT VALID
  `);
  /**
   * CHECK (FALSE) faz qualquer nova inserção de conta falhar.
   * O NOT VALID permite adicionar a restrição sem verificar as contas existentes,
   * mas ela continua sendo aplicada às novas inserções.
   */

  try {
    await expect(registrarCliente(dados)).rejects.toMatchObject({
      code: "23514", // Violação de CHECK
      constraint: "contas_falha_provocada_teste",
    });

    const consultaCliente = await pool.query(
      "SELECT id FROM clientes WHERE email = $1",
      [dados.email],
    );

    expect(consultaCliente.rows).toHaveLength(0);

    const consultaDepois = await pool.query<{ total: string }>(
      "SELECT COUNT(*) AS total FROM contas",
    );

    expect(consultaDepois.rows[0].total).toBe(totalAntes);
  } finally {
    await pool.query(`
      ALTER TABLE contas
      DROP CONSTRAINT contas_falha_provocada_teste
    `);
  }
});
