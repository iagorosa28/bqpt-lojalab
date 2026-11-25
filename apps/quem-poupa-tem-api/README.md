# API do Banco Quem Poupa Tem

API em TypeScript com Node.js, Express, PostgreSQL (`pg`), Argon2id, Vitest e
Supertest. Disponibiliza `GET /health` e `POST /clientes` para cadastro de cliente
e abertura de conta fictícia na mesma transação. A interface React de cadastro
será desenvolvida separadamente.

## Pré-requisitos

Instale as dependências pela raiz, conforme o [README principal](../../README.md#instalação).
Use PostgreSQL local (o CI usa a versão 18), com o serviço em execução e o
cliente `psql` disponível.

Se o PowerShell não reconhecer `psql`, substitua-o nos comandos pelo caminho
completo da sua instalação, por exemplo:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe"
```

## Banco de desenvolvimento

Conecte-se como administrador:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -W
```

Dentro do psql, crie o usuário e o banco somente se ainda não existirem.
Execute uma instrução por vez e conclua a senha solicitada por `\password`
antes de criar o banco:

```text
CREATE ROLE bqpt_app LOGIN;
\password bqpt_app
CREATE DATABASE quem_poupa_tem_dev OWNER bqpt_app;
```

Saia com `\q`. A partir daqui, execute os comandos do terminal na pasta
`apps/quem-poupa-tem-api`.

Crie o arquivo local sem sobrescrever uma configuração existente:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Configure o `.env`:

| Variável      | Desenvolvimento            |
| ------------- | -------------------------- |
| `DB_HOST`     | `localhost`                |
| `DB_PORT`     | `5432`                     |
| `DB_NAME`     | `quem_poupa_tem_dev`       |
| `DB_USER`     | `bqpt_app`                 |
| `DB_PASSWORD` | Senha local de `bqpt_app`. |

Não versione arquivos com senhas. Os exemplos devem permanecer sem segredos.

Aplique `sql/schema.sql` ao banco ainda sem as tabelas da aplicação:

```powershell
psql -h localhost -p 5432 -U bqpt_app -d quem_poupa_tem_dev -W -v ON_ERROR_STOP=1 --single-transaction -f .\sql\schema.sql
```

O script cria `clientes`, `contas` e a sequence do número da conta. É um script
de criação inicial, não de atualização: não o execute novamente sobre essas
tabelas existentes. Editar o arquivo não altera um banco já preparado.

Para conferir a estrutura, conecte-se:

```powershell
psql -h localhost -p 5432 -U bqpt_app -d quem_poupa_tem_dev -W
```

Dentro do psql:

```text
\dt
\d clientes
\d contas
\q
```

## Banco de testes

Use exclusivamente `quem_poupa_tem_test` para os testes com banco real.
Conectado como administrador ao banco `postgres`, crie-o se ainda não existir:

```sql
CREATE DATABASE quem_poupa_tem_test OWNER bqpt_app;
```

Depois de sair do psql, na pasta da API, aplique o esquema ao banco de testes vazio:

```powershell
psql -h localhost -p 5432 -U bqpt_app -d quem_poupa_tem_test -W -v ON_ERROR_STOP=1 --single-transaction -f .\sql\schema.sql
if (-not (Test-Path .env.test)) { Copy-Item .env.test.example .env.test }
```

No `.env.test`, mantenha as variáveis da tabela anterior, alterando `DB_NAME`
para `quem_poupa_tem_test` e preenchendo a senha local. Esse arquivo é ignorado
pelo Git; `.env.test.example` é versionado sem senha.

Os scripts de teste carregam `.env.test`, se existir. Variáveis já definidas
no ambiente têm prioridade; o `.env` de desenvolvimento não é carregado por
esses scripts. No CI, a conexão e o banco são preparados pelo workflow.

Os testes do repository verificam o banco de destino e removem registros de
`ana@example.com` após cada cenário. O teste de rollback também adiciona uma
restrição temporária em `contas`, removida no `finally`. Não execute outras
gravações ou suítes simultaneamente nesse banco; mantenha os testes desse
arquivo sequenciais. Após interrupção abrupta, confira registros e a restrição
`contas_falha_provocada_teste` remanescentes antes de repetir os testes.

## Execução e verificações

Na pasta da API:

| Comando               | Finalidade                                                         |
| --------------------- | ------------------------------------------------------------------ |
| `pnpm run dev`        | Iniciar com reinício automático; exige `.env`.                     |
| `pnpm run typecheck`  | Verificar tipos do código e dos testes.                            |
| `pnpm run test`       | Executar todos os testes; exige o banco de testes preparado.       |
| `pnpm run test:watch` | Acompanhar alterações e reexecutar testes.                         |
| `pnpm run build`      | Compilar para `dist`.                                              |
| `pnpm run start`      | Executar o build; lê `.env`, se existir, ou variáveis do ambiente. |

Gere um novo build antes de usar `start` após alterar o código. A API verifica a
conexão ao PostgreSQL antes de abrir a porta 3000. Use `Ctrl+C` para encerrá-la.
Não há script de lint próprio da API; a formatação é verificada na raiz.

[GET /health](http://localhost:3000/health) retorna status 200 e:

```json
{ "mensagem": "OK my friend :)" }
```

O endpoint não consulta o banco a cada chamada. Para executar testes isolados,
sem iniciar o servidor HTTP:

```powershell
pnpm run test tests/unit/clientes.service.test.ts
pnpm run test tests/api/health.test.ts
pnpm run test tests/api/clientes.test.ts
pnpm run test tests/integration/clientes.repository.test.ts
```

Somente o último desses arquivos exige PostgreSQL. Os testes unitários simulam
Argon2 e repository: não exercitam o cálculo real do hash nem a persistência.
Os testes HTTP de cadastro simulam o service e verificam rota, respostas e JSON
malformado; não exercitam o fluxo completo até o banco.

## Cadastro de cliente

Envie `POST http://localhost:3000/clientes` com `Content-Type: application/json`.
Exemplo com dados e credencial fictícios:

```json
{
  "email": "cliente@example.com",
  "nome": "Cliente",
  "sobrenome": "Teste",
  "senha": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
```

Todos os campos são obrigatórios e devem ser strings. O email é normalizado
para minúsculas e sem espaços nas extremidades; nome e sobrenome também perdem
esses espaços. Limites: email 254, nome 80 e sobrenome 150 caracteres.
O campo `senha` representa uma credencial SHA-256 hexadecimal de 64 caracteres,
não a senha original. O backend gera Argon2id e persiste apenas o hash final.
Não registre nem retorne credenciais ou hashes.

Sucesso (`201`):

```json
{
  "mensagem": "Cadastro realizado com sucesso.",
  "dados": {
    "nome": "Cliente",
    "sobrenome": "Teste",
    "numeroConta": "00000001"
  }
}
```

O número é gerado pelo banco com oito dígitos; não é necessariamente o do exemplo.
A conta começa com saldo zero e data de criação preenchida.

| Status | Situação e resposta                                                                      |
| ------ | ---------------------------------------------------------------------------------------- |
| `400`  | Validação: `{ "mensagem": "<motivo da validação>" }`.                                    |
| `400`  | JSON malformado: `{ "mensagem": "O corpo da requisição deve conter um JSON válido." }`.  |
| `409`  | Email duplicado: `{ "mensagem": "E-mail já cadastrado." }`.                              |
| `500`  | Falha inesperada no cadastro: `{ "mensagem": "Não foi possível concluir o cadastro." }`. |

## Estrutura

- `src/app.ts` e `src/server.ts`: aplicação HTTP, inicialização e encerramento.
- `src/db`: pool de conexões.
- `src/modules/clientes`: rotas e controller HTTP, regras no service, persistência
  no repository, erros e tipos compartilhados.
- `sql/schema.sql`: estrutura inicial do banco.
- `tests/api`, `tests/integration` e `tests/unit`: testes por foco.
