// Iniciar o servidor HTTP em uma porta

import { app } from "./app.js";
import { pool } from "./db/pool.js";

async function encerrarPool() {
  try {
    await pool.end();
    console.log("Pool OFF!");
  } catch (erro) {
    console.error("Falha ao encerrar o pool:", erro);
    process.exitCode = 1;
  }
}

try {
  await pool.query("SELECT 1");
  console.log("Pool ON!");

  let encerrando = false;

  const server = app.listen(3000, async (erro) => {
    if (erro) {
      encerrando = true;
      console.error("Falha ao iniciar o servidor HTTP:", erro);
      process.exitCode = 1;
      await encerrarPool();
      return;
    }

    console.log("Servidor HTTP ON!");
  });

  function encerrarAplicacao() {
    if (encerrando) {
      return;
    }

    encerrando = true;
    console.log("Encerrando a aplicação");

    server.close(async (erro) => {
      if (erro) {
        console.error("Falha ao encerrar o servidor HTTP:", erro);
        process.exitCode = 1;
      } else {
        console.log("Servidor HTTP OFF!");
      }
      await encerrarPool();
    });
  }

  process.on("SIGINT", encerrarAplicacao);
  process.on("SIGTERM", encerrarAplicacao);
} catch (erro) {
  console.error("Falha na inicialização do pool:", erro);

  // indica que a execução terminou com falha
  process.exitCode = 1;

  await encerrarPool();
}
