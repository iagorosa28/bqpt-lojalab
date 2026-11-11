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

As aplicações serão adicionadas gradualmente na pasta `apps/`.

**Observação:** os comandos para executar as aplicações
serão documentados conforme elas forem desenvolvidas.
