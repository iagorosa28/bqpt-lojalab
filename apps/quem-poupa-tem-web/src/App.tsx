import "./App.css";
import { useEffect, useState } from "react";
import { consultarHealth } from "./services/health";
import CadastroForm from "./features/cadastro/CadastroForm";

type EstadoConsulta = "carregando" | "sucesso" | "erro";

const textoStatus: Record<EstadoConsulta, string> = {
  carregando: "Consultando API...",
  sucesso: "API disponível!",
  erro: "Falha na consulta",
};

function App() {
  const [status, setStatus] = useState<EstadoConsulta>("carregando");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarHealth() {
      try {
        const resposta = await consultarHealth();

        if (!ativo) return;

        setStatus("sucesso");
        setMensagem(resposta.mensagem);
      } catch (erro) {
        if (!ativo) return;

        setStatus("erro");
        if (erro instanceof Error) {
          setMensagem(erro.message);
        } else {
          setMensagem("Não foi possível consultar a API.");
        }
      }
    }

    carregarHealth();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="app">
      <h1>Banco Quem Poupa Tem</h1>
      <div className="status-api" role="status">
        <p className={`status-${status}`}>{textoStatus[status]}</p>
        <p>{mensagem}</p>
      </div>
      <CadastroForm />
    </main>
  );
}

export default App;
