import * as argon2 from "argon2";
import { ErroValidacao } from "../../errors/erro-validacao.js";
import { registrarCliente } from "./clientes.repository.js";
import type {
  DadosCadastroCliente,
  ResultadoCadastro,
} from "./clientes.types.js";

async function cadastrarCliente(
  dados: DadosCadastroCliente,
): Promise<ResultadoCadastro> {
  if (typeof dados !== "object" || dados === null || Array.isArray(dados)) {
    throw new ErroValidacao("Os dados do cadastro devem ser um objeto.");
  }

  if (typeof dados.email !== "string" || dados.email.trim().length === 0) {
    throw new ErroValidacao("E-mail é obrigatório e deve ser um texto.");
  }
  if (typeof dados.nome !== "string" || dados.nome.trim().length === 0) {
    throw new ErroValidacao("Nome é obrigatório e deve ser um texto.");
  }
  if (
    typeof dados.sobrenome !== "string" ||
    dados.sobrenome.trim().length === 0
  ) {
    throw new ErroValidacao("Sobrenome é obrigatório e deve ser um texto.");
  }
  if (
    typeof dados.senha !== "string" ||
    !/^[0-9a-fA-F]{64}$/.test(dados.senha)
    /**
     * ".test" é um método do objeto regex que verifica se uma string corresponde ao padrão.
     * Ele retorna um booleano.
     */
  ) {
    throw new ErroValidacao(
      "A credencial deve conter exatamente 64 caracteres hexadecimais.",
    );
  }

  const emailNormalizado = dados.email.trim().toLowerCase();
  const nome = dados.nome.trim();
  const sobrenome = dados.sobrenome.trim();

  if (emailNormalizado.length > 254) {
    throw new ErroValidacao("E-mail deve ter no máximo 254 caracteres.");
  }
  if (nome.length > 80) {
    throw new ErroValidacao("Nome deve ter no máximo 80 caracteres.");
  }
  if (sobrenome.length > 150) {
    throw new ErroValidacao("Sobrenome deve ter no máximo 150 caracteres.");
  }

  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formatoEmail.test(emailNormalizado)) {
    throw new ErroValidacao("E-mail inválido.");
  }

  const senhaHash = await argon2.hash(dados.senha, {
    type: argon2.argon2id,
  });

  const resultado = await registrarCliente({
    email: emailNormalizado,
    nome,
    sobrenome,
    senhaHash,
  });

  return resultado;
}

export { cadastrarCliente };
