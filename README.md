# Petshop Backend

API REST para sistema de gerenciamento de Petshop.

# Tecnologias Utilizadas

Node.js (ES Modules), Express, Prisma ORM, PostgreSQL, Zod e Swagger UI Express.

# Pré-requisitos

Node.js e PostgreSQL.

# Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto contendo as variáveis abaixo:

DATABASE_URL="postgresql://usuario:senha@localhost:5432/petshop?schema=public"
PORT=3000

# Instalação

Instale as dependências do projeto:

npm install

# Banco de Dados

Crie as tabelas no banco de dados:

npm run db:migrate

Popule o banco com os dados iniciais:

npm run db:seed

# Execução da Aplicação

Iniciar o servidor em modo de desenvolvimento:

npm run dev 

Iniciar o servidor em modo de produção:

npm run start

# Testes

Executar suíte de testes:

npm test

# Documentação da API

Acesse a interface do Swagger através da URL abaixo com o servidor em execução

http://localhost:3000/api/docs