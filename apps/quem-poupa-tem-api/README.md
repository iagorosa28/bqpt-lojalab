# API do Banco Quem Poupa Tem

API do BQPT em desenvolvimento, com servidor Express, endpoint de saúde e
conexão ao PostgreSQL por meio de um pool da biblioteca `pg`. O repository de
clientes já cadastra cliente e conta em uma transação, com testes de integração.
O cadastro ainda não está exposto por um endpoint HTTP; service, controller e
rota dessa funcionalidade permanecem pendentes.

## Tecnologias

- **Node.js e Express:** execução da aplicação e criação das rotas HTTP.
- **TypeScript:** código com verificação de tipos.
- **PostgreSQL e pg:** banco de desenvolvimento e gerenciamento de conexões.
- **tsx:** execução de TypeScript durante o desenvolvimento.
- **Vitest e Supertest:** execução de testes e simulação de requisições HTTP nos testes.

## Instalação

As dependências são instaladas pela raiz do monorepo, seguindo as
[instruções do README principal](../../README.md#instalação).

## PostgreSQL local

Instale o PostgreSQL, mantenha seu serviço em execução e disponibilize o cliente
`psql` no terminal. No Windows, também é possível usar o SQL Shell (psql)
fornecido pela instalação para executar os comandos interativos.

Se o PowerShell não reconhecer `psql`, use o caminho completo do executável.
Por exemplo, para uma instalação do PostgreSQL 18 no caminho padrão, substitua
`psql` nos comandos deste documento por:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe"
```

### Criar usuário e banco de desenvolvimento

Em uma instalação nova, conecte-se ao banco `postgres` com um usuário
administrador, por exemplo:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -W
```

Dentro do `psql`, execute os comandos abaixo, um por vez, somente se o usuário
e o banco ainda não existirem. Conclua a definição da senha solicitada por
`\password` antes de executar `CREATE DATABASE`:

```text
CREATE ROLE bqpt_app LOGIN;
\password bqpt_app
CREATE DATABASE quem_poupa_tem_dev OWNER bqpt_app;
```

O comando `\password` solicita a senha de forma interativa. A senha deve ficar
somente na configuração local, sem ser escrita neste documento ou versionada.
Use `\q` para sair do `psql`.

Referências oficiais: [CREATE ROLE](https://www.postgresql.org/docs/18/sql-createrole.html),
[CREATE DATABASE](https://www.postgresql.org/docs/18/sql-createdatabase.html) e
[psql](https://www.postgresql.org/docs/18/app-psql.html).

### Configurar as variáveis de ambiente

Na pasta `apps/quem-poupa-tem-api`, crie o `.env` a partir do exemplo, caso ainda
não exista. No PowerShell:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Confira os valores e preencha `DB_PASSWORD` no `.env` com a senha local escolhida:

| Variável      | Valor do exemplo                         |
| ------------- | ---------------------------------------- |
| `DB_HOST`     | `localhost`                              |
| `DB_PORT`     | `5432`                                   |
| `DB_NAME`     | `quem_poupa_tem_dev`                     |
| `DB_USER`     | `bqpt_app`                               |
| `DB_PASSWORD` | Vazio; preencher apenas no `.env` local. |

O `.env` é ignorado pelo Git. O `.env.example` é versionado sem senha.
O script `dev` exige o `.env`; o script `start` lê esse arquivo quando ele
existe e também permite usar variáveis já definidas no ambiente.

### Conferir o acesso ao banco

No terminal, o comando abaixo solicita a senha e executa uma consulta simples:

```powershell
psql -h localhost -p 5432 -U bqpt_app -d quem_poupa_tem_dev -W -c "SELECT 1;"
```

O resultado deve conter uma linha com o número `1`. Essa verificação confirma
o acesso pelo cliente `psql`; a API verifica seu próprio acesso ao iniciar.

## Scripts configurados

Na pasta `apps/quem-poupa-tem-api`, os comandos são:

| Comando               | Para que serve                                                           |
| --------------------- | ------------------------------------------------------------------------ |
| `pnpm run dev`        | Executa `src/server.ts` com tsx e reinicia ao detectar alterações.       |
| `pnpm run build`      | Compila o TypeScript para JavaScript na pasta `dist`.                    |
| `pnpm run start`      | Executa `dist/server.js` com Node.js, após o build.                      |
| `pnpm run typecheck`  | Verifica os tipos de `src` e `tests` sem gerar arquivos JavaScript.      |
| `pnpm run test`       | Carrega `.env.test`, se existir, e executa os testes uma vez com Vitest. |
| `pnpm run test:watch` | Carrega `.env.test`, se existir, e acompanha alterações com Vitest.      |

## Execução e endpoint de saúde

Com o PostgreSQL e o `.env` preparados, execute `pnpm run dev` na pasta da API.
A inicialização executa `SELECT 1` pelo pool antes de iniciar o servidor HTTP.
Se a consulta funcionar, o terminal mostra `Pool ON!` e, após a abertura da
porta, `Servidor HTTP ON!`.

Acesse
[http://localhost:3000/health](http://localhost:3000/health).
O endpoint `GET /health` retorna status `200` e o JSON:

```json
{ "mensagem": "OK my friend :)" }
```

O endpoint confirma a resposta HTTP da aplicação; ele não executa uma consulta
ao PostgreSQL a cada requisição.

O comando permanece ativo; use `Ctrl+C` para encerrar. Para executar o JavaScript
compilado, use `pnpm run build` e depois `pnpm run start`. O script `start` usa
o conteúdo de `dist`, portanto gere um novo build após alterar o TypeScript.

## Conexão e encerramento

- `src/db/pool.ts` cria e exporta o pool compartilhado, com tempo limite de
  conexão de 5 segundos e tratamento do evento de erro de conexões ociosas.
- `src/server.ts` verifica a conexão, inicia o HTTP e coordena o encerramento.
- Se a consulta inicial ou a abertura da porta HTTP falhar, a aplicação
  registra o erro, define o código de saída `1` e tenta encerrar o pool.
- Ao receber `SIGINT` ou `SIGTERM`, o servidor para de aceitar novas conexões,
  aguarda as requisições em andamento terminarem e depois encerra o pool.
  A variável `encerrando` impede executar essa rotina mais de uma vez.
- `Ctrl+C` normalmente gera `SIGINT`. O suporte a sinais depende do sistema;
  no Windows, `SIGTERM` não tem o mesmo suporte nativo dos sistemas Unix.
- Uma falha de conexão ociosa é registrada pelo evento `error` do pool e não
  inicia, por si só, o encerramento da API.

O tempo limite de conexão não limita a duração de uma consulta SQL. O pool
cria conexões conforme necessário e permite reutilizá-las; `pool.end()`
encerra os recursos da API relacionados ao pool, sem desligar o PostgreSQL.

Referências oficiais: [Pool do pg](https://node-postgres.com/apis/pool),
[encerramento no Express](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown/)
e [sinais no Node.js](https://nodejs.org/api/process.html#signal-events).

## Estrutura SQL

O arquivo `sql/schema.sql` define:

- `clientes`: ID automático, email único em minúsculas e sem espaços comuns nas
  extremidades, nome, sobrenome e hash da senha. O `CHECK` de email exige
  normalização, mas não valida o formato completo do endereço.
- `contas`: ID automático, vínculo único com o cliente, número de conta único,
  saldo inicial zero e não negativo, além da data de criação.
- `contas_numero_conta_seq`: gera números de 1 a 99999999. O valor padrão da
  coluna formata o número com oito dígitos e zeros à esquerda. A sequence está
  vinculada à coluna por `OWNED BY` e pode apresentar lacunas após falhas.

Para criar a estrutura em um banco de desenvolvimento ainda sem essas tabelas,
execute na pasta da API:

```powershell
psql -h localhost -p 5432 -U bqpt_app -d quem_poupa_tem_dev -W -v ON_ERROR_STOP=1 --single-transaction -f .\sql\schema.sql
```

O script é de criação inicial: não o execute novamente sobre tabelas existentes.
Editar o arquivo não altera um banco já preparado; mudanças posteriores exigem
instruções de alteração correspondentes, como `ALTER TABLE`.

O repository em `src/modules/clientes/clientes.repository.ts` recebe email,
nome, sobrenome e `senhaHash`. Ele usa consultas parametrizadas e uma única
conexão para criar cliente e conta entre `BEGIN` e `COMMIT`; em caso de erro,
executa `ROLLBACK` e relança o erro. Após confirmar a transação, retorna nome,
sobrenome e número da conta. A conexão é liberada no `finally`.

## Banco e testes de integração

Use `quem_poupa_tem_dev` para desenvolvimento e `quem_poupa_tem_test` para os
testes. Não é necessário iniciar o servidor HTTP para testar o repository.

### Preparar o banco local de testes

Conecte-se como administrador:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -W
```

Dentro do psql, crie o banco somente se ainda não existir, usando o usuário
`bqpt_app` criado anteriormente:

```sql
CREATE DATABASE quem_poupa_tem_test OWNER bqpt_app;
```

Saia com `\q`. Na pasta da API, aplique o esquema ao banco de testes vazio:

```powershell
psql -h localhost -p 5432 -U bqpt_app -d quem_poupa_tem_test -W -v ON_ERROR_STOP=1 --single-transaction -f .\sql\schema.sql
```

Crie a configuração local a partir do exemplo, sem sobrescrever um arquivo
existente:

```powershell
if (-not (Test-Path .env.test)) { Copy-Item .env.test.example .env.test }
```

Preencha `DB_PASSWORD` apenas no `.env.test`, com a senha local de `bqpt_app`,
e mantenha `DB_NAME=quem_poupa_tem_test`. O `.env.test` é ignorado pelo Git;
o `.env.test.example` é versionado sem senha.

Os scripts de teste carregam `.env.test` com o Node antes de iniciar o Vitest.
Variáveis já definidas no ambiente têm prioridade. O `.env` de desenvolvimento
não é carregado por esses scripts; no CI, as variáveis são fornecidas pelo job.

### Cobertura e limpeza

Os arquivos ficam em `tests/integration`:

- `health.test.ts`: verifica status e mensagem do endpoint com Supertest, sem
  precisar de banco ou servidor HTTP em uma porta.
- `clientes.repository.test.ts`: verifica cadastro e persistência de cliente e
  conta, rejeição de email duplicado e rollback se a criação da conta falhar.

O teste do repository confirma o nome do banco na configuração e na conexão
real antes das gravações. Após cada teste, remove contas e clientes associados
ao email de teste `ana@example.com`; a limpeza depende dessa confirmação.
O pool é encerrado ao final do arquivo.

O cenário de rollback adiciona uma restrição temporária `CHECK (FALSE)` em
`contas` e a remove no `finally`. Não execute outras gravações ou outra execução
da suíte no mesmo banco enquanto esse cenário estiver ativo. Os testes desse
arquivo devem permanecer sequenciais. Se uma execução for interrompida
abruptamente, confira possíveis registros e a restrição temporária remanescentes
antes de repetir os testes.

Para executar apenas o arquivo do repository, na pasta da API:

```powershell
pnpm run test tests/integration/clientes.repository.test.ts
```

## Verificações locais

Na pasta da API:

```powershell
pnpm run typecheck
pnpm run test
pnpm run build
```

O comando `test` inclui os testes do repository e exige o banco de testes
preparado conforme a seção anterior. O teste HTTP, isoladamente, não precisa
do banco e não cobre a inicialização nem o encerramento do servidor.
O build usa `tsconfig.json` para compilar apenas `src`; a verificação de tipos
usa `tsconfig.typecheck.json` para incluir também `tests`.

Após o build, use `pnpm run start` para conferir os cenários abaixo, sem o
reinício automático do modo de desenvolvimento:

| Cenário                             | Resultado esperado                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| Banco disponível e porta HTTP livre | Consulta inicial funciona, HTTP inicia e `/health` responde `200`.              |
| Conexão inicial inválida            | Erro é registrado, HTTP não inicia e processo termina com código `1`.           |
| Porta `3000` ocupada                | Falha do HTTP é registrada, pool é encerrado e processo termina com código `1`. |
| `Ctrl+C` após iniciar normalmente   | `Servidor HTTP OFF!` aparece antes de `Pool OFF!`, sem mensagem de falha.       |

Para simular uma conexão inválida, use temporariamente no `.env` uma porta
local sem PostgreSQL e restaure o valor correto após a verificação. Para
simular a porta HTTP ocupada, mantenha uma instância da API aberta e tente
iniciar outra em um segundo terminal.

No PowerShell, consulte `$LASTEXITCODE` imediatamente depois que o comando
terminar para conferir o código de saída. Confira também se os diagnósticos
de falha não exibem senhas ou outros segredos antes de compartilhar resultados.

Esta seção descreve as verificações a executar; não registra aprovação nem
resultados de testes.
