# Url-Shortener

Implementação de um sistema que encurte as URLs

[Detalhamento do teste](https://docs.google.com/document/d/1eZpPju0EHUO5tzGgi3J3G0dtGX8G9i6eh1FU39WYg2M/edit?tab=t.0#heading=h.hlpf0wifxco1)

## Tecnologias Utilizadas

- Backend: **NestJS**
- Testes: **Jest**
- Banco de dados: **PostgreSQL** com **TypeORM**
- Documentação: **Swagger**
- Containerização: **Docker**
- Autenticação: **JWT**

## Como rodar o projeto

- Execute `npm run docker` para iniciar a aplicação

  - A aplicação estará rodando na porta 3000 (Por padrão: `http://localhost:3000`)
  - O banco de dados estará disponível na porta 5432 (Por padrão: `localhost:5432`)

- Caso queira executar a aplicação em segundo plano, use:

  - `npm run docker:up`

- Para interromper e remover os containers, use:

  - `npm run docker:down`

- Com a aplicação rodando, execute:

  - `npm run seed` para popular o banco de dados com dados mockados
  - `npm run seed:user` para popular somente a tabela de usuários
  - `npm run seed:url` para popular somente a tabela de URLs

- A documentação (Swagger) estará disponível (por padrão) em `http://localhost:3000/api/docs`

- Para rodar os testes:
  - Localmente: `npm run test`
  - Com docker: `npm run docker:test`

## Estrutura do Banco de Dados

Para este projeto foram criadas duas estruturas, `User` e `Url`, que se relacionam da seguinte forma:

- Um usuário pode ter muitas URLs (relacionamento `OneToMany` entre `User` e `Url`)
- Uma URL pode ter um único usuário associado (relacionamento `ManyToOne` de `Url` para `User`)
  - Uma URL pode existir sem um usuário associado
- A exclusão de uma URL é feita como _soft delete_, ou seja, o campo `deletedAt` é preenchido em vez de excluí-las fisicamente
- Quando um usuário é excluído (não há endpoint para isso ainda), as URLs associadas não são excluídas, o campo de relacionamento é definido como NULL

Abaixo estão as entidades criadas para este projeto:

### Tabela `users` (`User`)

Representa os usuários do sistema.

#### Campos:

- `id`: Identificador único do usuário (UUID).
- `email`: E-mail único do usuário.
- `password`: Senha do usuário.
- `createdAt`: Data de criação do registro.
- `updatedAt`: Data da última atualização.
- `deletedAt`: Data de deleção (soft delete).

### Tabela `urls` (`Url`)

Representa os URLs encurtados.

#### Campos:

- `id`: Identificador único do URL (UUID).
- `shortCode`: Código curto gerado para o URL.
- `targetUrl`: URL original que foi encurtada.
- `clicks`: Contador de cliques no URL.
- `user`: Relacionamento com o usuário (opcional, um usuário pode ter vários URLs).
- `createdAt`: Data de criação do URL.
- `updatedAt`: Data da última atualização.
- `deletedAt`: Data de deleção (soft delete).

### Os endpoins disponíveis são:

- **POST** `/auth/register`: Criação de um usuário
- **POST** `/auth/login`: Login para a obtenção de um Bearer token
- **POST** `/url`: Encurtamento de URL
- **GET** `/user/urls`: Listagem de URLs de um usuário autenticado
- **GET** `/user/url/:shortCode`: Retorno para uma URL específica
- **PATCH** `/user/urls`: Atualização da URL destino de uma URL incurtada
- **DELETE** `/user/urls`: Soft delete de uma URL incurtada
- **GET** `/:shortCode`: Rota para o redirecionamento

### Arquivo .env utilizado

O projeto possui valores padrão definidos em código, portanto a única env necessária é `DATABASE_URL`.

O arquivo `.env` deve ser criado na raiz do projeto contendo obrigatóriamente este valor:

```
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/url-shortener-db'
```

Estas envs são opcionais:

```
PORT=3000
JWT_SECRET='dev-secret'
BASE_URL='http://localhost:3000'
```

## Estrutura do Projeto

Abaixo está a estrutura do projeto (gerada com _Draw Folder Structure_)

```
└── 📁Url-Shortener
    └── 📁.github
        └── 📁workflows
            └── lint.yml
            └── test.yml
    └── 📁.husky
        └── pre-commit
    └── 📁docker
        └── .dockerignore
        └── docker-compose.yaml
        └── Dockerfile
    └── 📁src
        └── app.module.ts
        └── 📁common
            └── 📁decorators
                └── get-user.decorator.ts
            └── 📁utils
                └── hash.util.ts
        └── 📁core
            └── 📁auth
                └── auth.controller.ts
                └── auth.module.ts
                └── 📁dtos
                    └── create-user.dto.ts
                    └── login-return.dto.ts
                └── 📁services
                    └── 📁auth
                        └── auth.service.spec.ts
                        └── auth.service.ts
            └── 📁redirect
                └── redirect.controller.ts
                └── redirect.module.ts
            └── 📁url
                └── 📁dtos
                    └── create-url.dto.ts
                    └── shortened-url-return.dto.ts
                └── 📁entities
                    └── url.entity.ts
                └── 📁services
                    └── 📁url
                        └── url.service.spec.ts
                        └── url.service.ts
                └── url.controller.ts
                └── url.module.ts
            └── 📁user
                └── 📁dtos
                    └── delete-url.dto.ts
                    └── list-urls.dto.ts
                    └── update-url.dto.ts
                └── 📁entities
                    └── user.entity.ts
                └── 📁services
                    └── 📁user
                        └── user.service.spec.ts
                        └── user.service.ts
                └── user.controller.ts
                └── user.module.ts
        └── 📁infra
            └── 📁database
                └── database.module.ts
                └── 📁seeders
                    └── main.seeder.ts
                    └── url.seeder.ts
                    └── user.seeder.ts
            └── 📁guard
                └── authorization.guard.ts
                └── authorization.interface.ts
                └── authorization.module.ts
                └── optional-auth.guard.ts
            └── infra.module.ts
        └── main.ts
    └── .env
    └── .gitignore
    └── .prettierignore
    └── .prettierrc
    └── eslint.config.mjs
    └── nest-cli.json
    └── package-lock.json
    └── package.json
    └── README.md
    └── tsconfig.build.json
    └── tsconfig.build.tsbuildinfo
    └── tsconfig.json
```
