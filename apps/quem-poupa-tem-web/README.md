# Frontend do Banco Quem Poupa Tem

Interface inicial em React, Vite e TypeScript que consulta a saúde da API e
apresenta carregamento, sucesso ou erro. Ainda não possui formulário de cadastro
nem funcionalidades bancárias.

## Execução local

Instale as dependências conforme o [README principal](../../README.md#instalação)
e prepare o PostgreSQL e o ambiente conforme o [README da API](../quem-poupa-tem-api/README.md).
A API precisa acessar o banco para iniciar.

Na raiz do monorepo, use dois terminais:

```powershell
pnpm --filter quem-poupa-tem-api dev
```

```powershell
pnpm --filter quem-poupa-tem-web dev
```

Abra o endereço informado pelo Vite, normalmente
[http://localhost:5173](http://localhost:5173). A porta pode mudar se estiver
ocupada. Use `Ctrl+C` para encerrar cada processo.

O proxy em `vite.config.ts` encaminha `/api/health` para
`http://localhost:3000/health`. Esse proxy funciona apenas no desenvolvimento;
uma publicação precisará configurar o encaminhamento de `/api` no servidor.

## Scripts e verificações

Na pasta `apps/quem-poupa-tem-web`:

| Comando            | Finalidade                             |
| ------------------ | -------------------------------------- |
| `pnpm run dev`     | Iniciar o servidor Vite.               |
| `pnpm run lint`    | Verificar o código com ESLint.         |
| `pnpm run build`   | Verificar tipos e gerar `dist`.        |
| `pnpm run preview` | Conferir localmente o build existente. |

Gere um novo build após alterar o código antes de usar `preview`. Ele serve
para conferência local, não como servidor de produção. Para formatação, use
os comandos da raiz descritos no README principal.

O frontend ainda não possui testes automatizados. Após lint e build, confira
no navegador os estados de carregamento, sucesso com a API ligada e erro com
a API desligada. Recarregue a página após religar a API: não há novas tentativas
automáticas. Lint e build não substituem essa verificação de comportamento.

## Estrutura

- `src/App.tsx`: tela e estados da consulta.
- `src/services`: comunicação HTTP com a API.
- `src/main.tsx` e arquivos CSS: inicialização e estilos.
