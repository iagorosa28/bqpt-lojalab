import { pool } from "../../db/pool.js";

type DadosCliente = {
  email: string;
  nome: string;
  sobrenome: string;
  senhaHash: string;
};

type ResultadoCadastro = {
  nome: string;
  sobrenome: string;
  numeroConta: string;
};

async function registrarCliente(
  dados: DadosCliente,
): Promise<ResultadoCadastro> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resultadoCliente = await client.query<{ id: string }>(
      "INSERT INTO clientes (email, nome, sobrenome, senha_hash) VALUES ($1, $2, $3, $4) RETURNING id",
      [dados.email, dados.nome, dados.sobrenome, dados.senhaHash],
    );

    const clienteId = resultadoCliente.rows[0].id;

    const resultadoConta = await client.query<{ numero_conta: string }>(
      "INSERT INTO contas (cliente_id) VALUES ($1) RETURNING numero_conta",
      [clienteId],
    );

    await client.query("COMMIT");

    return {
      nome: dados.nome,
      sobrenome: dados.sobrenome,
      numeroConta: resultadoConta.rows[0].numero_conta,
    };
  } catch (erro) {
    await client.query("ROLLBACK");
    throw erro;
  } finally {
    client.release();
  }
}

export { registrarCliente };
