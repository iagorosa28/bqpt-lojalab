type HealthResponse = {
  mensagem: string;
};

async function consultarHealth(): Promise<HealthResponse> {
  const resposta = await fetch("/api/health");

  if (!resposta.ok) {
    throw new Error(`Erro ao consultar a API: ${resposta.status}`);
  }

  return await resposta.json();
}

export { consultarHealth };
