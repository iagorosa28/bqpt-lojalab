# API do Banco Quem Poupa Tem

Configuração inicial da API do BQPT. O servidor, os endpoints e os testes serão
implementados na próxima etapa.

## Tecnologias

- **Node.js e Express:** execução da aplicação e criação das rotas HTTP.
- **TypeScript:** código com verificação de tipos.
- **tsx:** execução de TypeScript durante o desenvolvimento.
- **Vitest e Supertest:** execução de testes e simulação de requisições HTTP nos testes.

## Instalação

As dependências são instaladas pela raiz do monorepo, seguindo as
[instruções do README principal](../../README.md#instalação).

## Scripts configurados

Na pasta `apps/quem-poupa-tem-api`, os comandos são:

| Comando | Para que serve |
| --- | --- |
| `pnpm run dev` | Executa `src/server.ts` com tsx e reinicia ao detectar alterações. |
| `pnpm run build` | Compila o TypeScript para JavaScript na pasta `dist`. |
| `pnpm run start` | Executa `dist/server.js` com Node.js, após o build. |
| `pnpm run typecheck` | Verifica os tipos sem gerar arquivos JavaScript. |
| `pnpm run test` | Executa os testes uma vez com Vitest. |
| `pnpm run test:watch` | Mantém o Vitest aberto e reexecuta os testes ao detectar alterações. |

Os scripts estão configurados; sua utilização depende dos arquivos de código e
de testes que serão criados na próxima etapa.
