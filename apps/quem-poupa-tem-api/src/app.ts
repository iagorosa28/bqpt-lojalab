// Criar e configurar a aplicação Express, incluindo suas rotas

import express from "express";
import type { ErrorRequestHandler } from "express";
import { clientesRoutes } from "./modules/clientes/clientes.routes.js";

const app = express();

app.use(express.json());
app.use("/clientes", clientesRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    mensagem: "OK my friend :)",
  });
});

const tratarErroJson: ErrorRequestHandler = (
  erro: unknown, // Tipo ainda desconhecido; precisamos conferir antes de acessar propriedades.
  _req,
  res,
  next,
) => {
  if (
    erro instanceof SyntaxError && // Confere se é um erro de sintaxe.
    "type" in erro && // Confere se a propriedade "type" existe no erro.
    erro.type === "entity.parse.failed" // Identifica a falha ao interpretar o corpo JSON.
  ) {
    return res.status(400).json({
      mensagem: "O corpo da requisição deve conter um JSON válido.",
    });
  }

  next(erro); // Encaminha outros erros ao próximo tratamento de erros do Express.
};

app.use(tratarErroJson);

export { app };
