import type { Request, Response } from "express";
import { ErroValidacao } from "../../errors/erro-validacao.js";
import { ErroEmailDuplicado } from "./clientes.errors.js";
import { cadastrarCliente as cadastrarClienteService } from "./clientes.service.js";

async function cadastrarCliente(req: Request, res: Response) {
  try {
    const cliente = await cadastrarClienteService(req.body);

    return res.status(201).json({
      mensagem: "Cadastro realizado com sucesso.",
      dados: {
        nome: cliente.nome,
        sobrenome: cliente.sobrenome,
        numeroConta: cliente.numeroConta,
      },
    });
  } catch (erro) {
    if (erro instanceof ErroValidacao) {
      return res.status(400).json({
        // validação
        mensagem: erro.message,
      });
    }

    if (erro instanceof ErroEmailDuplicado) {
      return res.status(409).json({
        // duplicidade
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      // erro desconhecido
      mensagem: "Não foi possível concluir o cadastro.",
    });
  }
}

export { cadastrarCliente };
