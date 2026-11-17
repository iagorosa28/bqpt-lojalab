# Frontend do Banco Quem Poupa Tem

Interface inicial do BQPT em React, Vite e TypeScript. Consulta o endpoint de
saúde da API Express e apresenta carregamento, sucesso ou erro, junto da
mensagem retornada. Ainda não há formulários nem funcionalidades bancárias.

## Tecnologias

- **React:** componentes, estados e atualização da interface.
- **Vite:** servidor de desenvolvimento, proxy local e build do frontend.
- **TypeScript:** verificação de tipos.
- **CSS:** estilos globais e apresentação dos estados da consulta.
- **ESLint:** análise estática do código.

## Preparação e execução local

Instale as dependências pela raiz do monorepo, seguindo as
[instruções do README principal](../../README.md#instalação).

Prepare o PostgreSQL e o ambiente da API conforme o
[README do backend](../quem-poupa-tem-api/README.md). A API verifica a conexão
com o banco antes de iniciar o servidor HTTP.

Na raiz do monorepo, abra dois terminais. No primeiro, inicie a API:

```powershell
pnpm --filter quem-poupa-tem-api run dev
```

No segundo, inicie o frontend:

```powershell
pnpm --filter quem-poupa-tem-web run dev
```

Abra o endereço informado pelo Vite no terminal, normalmente
[http://localhost:5173](http://localhost:5173). Se essa porta estiver ocupada,
o Vite pode escolher outra. Use `Ctrl+C` para encerrar cada processo.

## Comunicação com a API

O service `src/services/health.ts` exporta `consultarHealth`, que faz uma
requisição `GET /api/health` usando `fetch`. O endereço é relativo à origem
do frontend.

O proxy de desenvolvimento está configurado em `vite.config.ts`:

1. O navegador solicita `/api/health` ao servidor do frontend.
2. O Vite encaminha a chamada para `http://localhost:3000`.
3. A regra de reescrita remove `/api`, resultando em `GET /health` na API.

Assim, o navegador faz a chamada para a própria origem do frontend, sem
precisar configurar CORS no backend para esse fluxo local. A resposta de
sucesso da API tem status `200` e este formato:

```json
{ "mensagem": "OK my friend :)" }
```

O service verifica `resposta.ok`, lança um erro para status HTTP fora de
`200` a `299` e devolve o corpo JSON no sucesso. `HealthResponse` descreve o
formato esperado em TypeScript; não faz validação do JSON em tempo de execução.

O proxy não faz parte dos arquivos gerados em `dist`. Uma publicação exigirá
configurar o encaminhamento de `/api` no ambiente que servir o frontend.
Referência: [proxy do Vite](https://vite.dev/config/server-options.html#server-proxy).

## Interface e organização

- `src/main.tsx`: inicia o React com `StrictMode` e importa os estilos globais.
- `src/App.tsx`: inicia a consulta em um efeito e controla status e mensagem.
- `src/services/health.ts`: concentra a comunicação com o endpoint de saúde.
- `src/index.css`: reset básico, fonte e cores gerais da página.
- `src/App.css`: organização da tela e estilos de cada status.

| Estado | Texto apresentado |
| --- | --- |
| `carregando` | Consultando API... |
| `sucesso` | API disponível! |
| `erro` | Falha na consulta |

O bloco de mensagens usa `role="status"` para permitir o anúncio das mudanças
por leitores de tela. Os estados têm textos distintos e cores escuras sobre
o fundo claro, para que a informação não dependa apenas da cor.

A limpeza do efeito marca sua execução como inativa e impede atualizações de
estado por resultados que cheguem após essa limpeza. Ela não cancela a
requisição HTTP. Em desenvolvimento, o `StrictMode` pode provocar uma consulta
extra durante seu ciclo adicional de execução e limpeza do efeito.

A consulta ocorre na montagem do componente. Após religar uma API que estava
indisponível, recarregue a página para tentar novamente; não há novas tentativas
automáticas nesta etapa.

## Scripts

Na pasta `apps/quem-poupa-tem-web`:

| Comando | Para que serve |
| --- | --- |
| `pnpm run dev` | Inicia o servidor de desenvolvimento do Vite. |
| `pnpm run lint` | Verifica o código com ESLint. |
| `pnpm run build` | Verifica o TypeScript com `tsc -b` e gera o build em `dist`. |
| `pnpm run preview` | Serve o build existente para conferência local. |

Na raiz, use `pnpm --filter quem-poupa-tem-web run <script>`.
Gere um novo build após alterar o código antes de usar `preview`.
O preview é destinado à conferência local, não a servir a aplicação em produção.
Referência: [build e preview do Vite](https://vite.dev/guide/static-deploy.html).

## Verificações locais

Na pasta do frontend, execute:

```powershell
pnpm run lint
pnpm run build
```

Com o frontend em modo de desenvolvimento, confira no navegador:

| Cenário | Resultado esperado |
| --- | --- |
| API ligada e página recarregada | Estado de sucesso e mensagem retornada pela API. |
| API desligada e página recarregada | Estado de erro e mensagem básica, sem travar a interface. |
| API religada e página recarregada | Nova consulta retorna ao estado de sucesso. |
| Consulta em andamento | Texto de carregamento até a conclusão ou falha. |

Para observar o carregamento, é possível simular uma conexão lenta nas
ferramentas de desenvolvimento do navegador. Confira também o console com a
API ligada e o anúncio das mudanças com um leitor de tela. Em falhas, o status
HTTP pode ser gerado pelo proxy; não depende de ser um código específico.

O frontend ainda não possui testes automatizados nem script `test`.
Lint e build não substituem as verificações de comportamento no navegador.
Esta seção descreve verificações a executar; não registra resultados de testes.
