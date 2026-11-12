# API do Banco Quem Poupa Tem

API inicial do BQPT, com servidor Express, endpoint de saúde e teste HTTP.
Ainda não há regras bancárias nem acesso ao banco de dados.

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
| `pnpm run typecheck` | Verifica os tipos de `src` e `tests` sem gerar arquivos JavaScript. |
| `pnpm run test` | Executa os testes uma vez com Vitest. |
| `pnpm run test:watch` | Mantém o Vitest aberto e reexecuta os testes ao detectar alterações. |

## Execução e endpoint de saúde

Execute `pnpm run dev` na pasta da API e acesse
[http://localhost:3000/health](http://localhost:3000/health).
O endpoint `GET /health` retorna status `200` e o JSON:

```json
{ "mensagem": "OK my friend :)" }
```

O comando permanece ativo; use `Ctrl+C` para encerrar. Para executar o JavaScript
compilado, use `pnpm run build` e depois `pnpm run start`.

O teste HTTP verifica o status e a mensagem usando a aplicação de `src/app.ts`,
sem precisar iniciar `src/server.ts` antes. O build usa `tsconfig.json` para
compilar apenas `src`; a verificação de tipos usa `tsconfig.typecheck.json` para
incluir também `tests`.
