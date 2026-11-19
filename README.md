# BQPT + LojaLab

Monorepo de estudos full-stack em TypeScript com dois sistemas fictícios:
Banco Quem Poupa Tem (BQPT) e LojaLab. A integração futura permitirá pagamentos
simulados, sem dinheiro ou serviços financeiros reais.

## Aplicações

| Aplicação     | Stack                                         | Documentação                                               |
| ------------- | --------------------------------------------- | ---------------------------------------------------------- |
| BQPT API      | Node.js, Express, PostgreSQL com `pg`, Argon2 | [Configuração e testes](apps/quem-poupa-tem-api/README.md) |
| BQPT frontend | React, Vite e TypeScript                      | [Execução local](apps/quem-poupa-tem-web/README.md)        |

A LojaLab será desenvolvida separadamente, com React + Vite e uma API Express
com MongoDB + Mongoose. As aplicações ficam em `apps/`, gerenciadas por pnpm
Workspaces. Cada README contém as instruções específicas da aplicação.

## Instalação

Pré-requisitos: Node.js 24 e pnpm na versão definida em `package.json`
(`packageManager`). Para a API BQPT, prepare também o PostgreSQL conforme seu README.

Na raiz do repositório:

```powershell
pnpm install --frozen-lockfile
```

Preserve `pnpm-lock.yaml` e as permissões de instalação em `pnpm-workspace.yaml`.
Não versione senhas, tokens ou arquivos de ambiente locais; use os arquivos
`.env*.example` como referência, mantendo-os sem segredos.

## Comandos

Execute na raiz:

| Comando                                | Finalidade                                  |
| -------------------------------------- | ------------------------------------------- |
| `pnpm run workspace:list`              | Listar os projetos do workspace.            |
| `pnpm --filter quem-poupa-tem-api dev` | Iniciar a API após preparar seu ambiente.   |
| `pnpm --filter quem-poupa-tem-web dev` | Iniciar o frontend.                         |
| `pnpm format:check`                    | Conferir a formatação do monorepo.          |
| `pnpm format`                          | Aplicar formatação; conferir o diff depois. |

## Verificações e CI

Prepare o [banco de testes da API](apps/quem-poupa-tem-api/README.md#banco-de-testes)
antes de executar a suíte completa. Na raiz:

```powershell
pnpm format:check
pnpm --filter quem-poupa-tem-web lint
pnpm --filter quem-poupa-tem-web build
pnpm --filter quem-poupa-tem-api typecheck
pnpm --filter quem-poupa-tem-api test
pnpm --filter quem-poupa-tem-api build
```

O workflow `.github/workflows/ci.yml` executa essas verificações nas PRs para
`main` e em novos pushes nas branches dessas PRs. Um push sem PR aberta não
dispara o workflow. O CI prepara um PostgreSQL 18 temporário, aplica o esquema
e fornece as variáveis de conexão, sem usar os arquivos `.env` locais.

Confira o resultado na aba **Checks** da PR ou **Actions** do repositório.
A validação local não substitui a execução bem-sucedida do CI.
