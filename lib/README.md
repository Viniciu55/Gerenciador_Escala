# Gerenciador de Escalas

Uma aplicação web simples, direta, rápida e responsiva construída com Next.js e React. O projeto tem como objetivo facilitar a construção de escalas de diversos times diferentes de uma igreja, levando em consideração a disponibilidade de cada voluntário e também permite a construção e exportação da escala em .png.

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenvolvido com as seguintes tecnologias:

* Next.js (v16.1.6): Framework React para renderização do lado do servidor (SSR), geração de sites estáticos (SSG) e roteamento.
* React: Biblioteca JavaScript para construção da interface de usuário.
* Tailwind CSS: Framework CSS utilitário para estilização rápida e responsiva.
* shadcn/ui & Radix UI: Componentes de interface modulares, acessíveis e altamente customizáveis.
* Lucide: Biblioteca de ícones limpos e consistentes.
* Vercel Analytics: Ferramenta de estatísticas e monitoramento de tráfego.
* Infraestrutura: Hospedagem e CI/CD gerenciados pela Vercel, com otimizações de performance (Priority Hints).

## ⚙️ Como rodar o projeto localmente

Siga os passos abaixo para testar o projeto na sua máquina:

### Pré-requisitos
* Node.js instalado (versão 18.x ou superior recomendada).
* Gerenciador de pacotes da sua preferência (npm, yarn, pnpm ou bun).

### Instalação

1. Dê um fork nesse repositório para copiar para sua conta.

2. Clone o repositório clonado para sua máquina local:
git clone https://github.com/seu-usuario/nome-do-repositorio.git

3. Acesse a pasta do projeto:
cd nome-do-repositorio

4. Instale as dependências:
pnpm install

    _ou yarn install / npm install_

5. Crie o banco de dados:
Para isso você pode usar qualquer um banco de dados sql. 
Na pasta scripts existem os arquivos 001_create_tables.sql, 002_create_schedule_tables.sql e 003_create_built_schedules.sql. 
Basta executar todos os comandos presentes nesses arquivos no seu banco de dados e modelo para o nosso banco de dados será criado.

6. Configurar as variáveis de ambiente:
Após criar o seu banco de dados, será necessário conectá-lo ao projeto, Para isso use o comando:

    ```cp .env.local.sample .env.local ```
    para criar o arquivo .env.local

Depois de criar esse arquivo, será necessário preencher os valores da url e chave do seu banco de dados dentro do .env.local, colocando nesses dois campos respectivamente:

    NEXT_PUBLIC_SUPABASE_URL=

    NEXT_PUBLIC_SUPABASE_ANON_KEY=

4. Inicie o servidor de desenvolvimento:
    ```pnpm run dev```
    _ou yarn dev / npm dev_


5. Abra o seu navegador e acesse:
http://localhost:3000

## ☁️ Deploy

Este projeto está configurado para ser facilmente implantado na Vercel. Basta conectar o repositório do GitHub à sua conta Vercel e o deploy contínuo será configurado automaticamente, será necessário inserir apenas a url e key do seu banco de dados no .env.local e o projeto já vai estar funcionando.