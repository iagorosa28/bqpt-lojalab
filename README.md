# bqpt-lojalab

Monorepo de estudos que reúne dois sistemas fictícios, Banco Quem Poupa Tem e LojaLab, desenvolvidos de forma independente e posteriormente integrados por APIs para simular pagamentos.

## Preparação do ambiente

### Ferramentas utilizadas

- Node.js
- pnpm

Configuração inicial testada com Node.js 24.22.2 e pnpm 11.25.0.

### Instalação

Na raiz do repositório, execute:

```bash
pnpm install
```

Para instalar as dependências sem alterar o arquivo
`pnpm-lock.yaml`, utilize:

```bash
pnpm install --frozen-lockfile
```

O projeto utiliza pnpm Workspaces para organizar
as aplicações em um único monorepo.

### Comandos do workspace

Para listar os projetos que fazem parte do monorepo:

```bash
pnpm run workspace:list
```

O comando utiliza `pnpm -r list --depth -1` para exibir os projetos sem suas dependências.

As aplicações ficam na pasta `apps/`.

**Observação:** os comandos e a preparação do ambiente de cada aplicação
estão documentados em seu próprio README.

### Formatação do código

O monorepo utiliza Prettier como dependência de desenvolvimento da raiz.
A configuração compartilhada em `.prettierrc.json` define indentação de
dois espaços, sem caracteres de tabulação.

Execute os comandos abaixo na raiz do repositório:

| Comando             | Para que serve                                                            |
| ------------------- | ------------------------------------------------------------------------- |
| `pnpm format`       | Aplica a formatação aos arquivos compatíveis e não ignorados do monorepo. |
| `pnpm format:check` | Confere a formatação sem modificar os arquivos.                           |

O arquivo `.prettierignore` exclui builds, cobertura e `pnpm-lock.yaml` da
formatação. O Prettier também ignora `node_modules` por padrão e, quando
executado na raiz, respeita o `.gitignore` desse diretório.

Depois de aplicar a formatação, confira o diff e execute `pnpm format:check`.
Os comandos podem afetar arquivos de ambas as aplicações e a documentação.
A formatação não substitui lint, verificação de tipos, build ou testes das
aplicações afetadas.

## Integração contínua (CI)

O workflow `CI`, definido em `.github/workflows/ci.yml`, executa automaticamente
nas Pull Requests destinadas à `main`, incluindo novas alterações enviadas à PR.
Ele prepara Node.js 24 e a versão do pnpm definida no `package.json`, instala
as dependências com o lockfile congelado e executa as verificações existentes.

Para acompanhar uma execução, abra a aba **Actions** do repositório e selecione
o workflow **CI**, ou acesse as verificações na aba **Checks** da PR. Abra o job
`verificacoes` e expanda uma etapa para consultar seus logs. Se um comando
falhar, o job fica reprovado e as verificações seguintes são puladas.

Para reproduzir as verificações localmente, execute na raiz do repositório:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm --filter quem-poupa-tem-web lint
pnpm --filter quem-poupa-tem-web build
pnpm --filter quem-poupa-tem-api typecheck
pnpm --filter quem-poupa-tem-api test
pnpm --filter quem-poupa-tem-api build
```

As verificações atuais não exigem PostgreSQL em execução nem arquivo `.env`.
Após abrir a PR, confira se todas as etapas do CI terminaram com sucesso no
GitHub; a validação local não substitui essa conferência.

## Aplicações

- [API do Banco Quem Poupa Tem](apps/quem-poupa-tem-api/README.md): tecnologias, setup do PostgreSQL, configuração do ambiente, conexão, encerramento, comandos e verificações locais.
- [Frontend do Banco Quem Poupa Tem](apps/quem-poupa-tem-web/README.md): React e Vite, execução local, proxy da API, estados da interface, comandos e verificações locais.
