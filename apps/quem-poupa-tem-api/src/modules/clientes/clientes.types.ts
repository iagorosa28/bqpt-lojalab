type DadosCadastroCliente = {
  email: string;
  nome: string;
  sobrenome: string;
  senha: string;
};

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

export type { DadosCadastroCliente, DadosCliente, ResultadoCadastro };
