# Car Flip Intelligence (CFI) 🏎️💼

**Car Flip Intelligence** é uma plataforma SaaS automotiva premium projetada para otimizar e gerenciar investimentos na compra, preparação e revenda de veículos (arbitragem de veículos / *car flipping*). Inspirada em plataformas modernas de investimentos e comunidades especializadas (como *Cars & Bids* e *AutoTrader*), a CFI oferece um painel financeiro poderoso, due-diligence passo a passo e controle granular de despesas em tempo real.

---

## 🚀 Principais Funcionalidades

### 1. Dashboard de Investimentos em Tempo Real
* **KPIs Financeiros Consolidados**:
  * **Lucro Realizado (Realized Profit)**: Calculado dinamicamente somando o resultado real das vendas concluídas.
  * **Capital em Estoque (Active Investment)**: Total de recursos aplicados nos veículos atualmente em preparação ou estoque.
  * **ROI Médio Real**: O Retorno sobre Investimento médio real de todas as vendas concluídas.
  * **Negócios Fechados**: Totalizador de veículos vendidos.
* **Oportunidades de Compra**: Cards contendo foto, dados técnicos, status de risco e preço sugerido de veículos que estão no funil de avaliação.
* **Histórico de Vendas Concluídas**: Tabela financeira descritiva detalhando data de encerramento, custo total, valor de venda e ROI/Lucro real de cada negócio fechado.

### 2. Fluxo Granular de Estoque e Preparação (`Meu Estoque`)
* **Status "No Estoque" (IN_STOCK)**: Transição suave do veículo do funil de avaliação para a fila de preparação pós-compra.
* **Gestão de Custos Adicionais (Expenses)**: Registro modular de despesas (mecânica, funilaria, limpeza, laudo, etc.).
* **Fechamento Automático de Caixa**: Ao registrar a venda final, o sistema soma todos os custos reais, abate o valor da venda e calcula o ROI de forma limpa, evitando erros humanos.

### 3. Wizard de Due-Diligence (`Nova Avaliação`)
* **Formulário Passo a Passo**:
  * **Etapa 1: Identificação**: Marca, Modelo, Ano, Placa, Renavam, VIN (opcional) e Link do Anúncio (OLX/Webmotors).
  * **Etapa 2: Precificação**: Preço sugerido, FIPE e Preço de Venda estimado.
  * **Etapas 3-5: Checklist de Risco**: Verificação mecânica, estrutural, histórico e burocracia (com função de preenchimento rápido "Marcar tudo como OK").
* **Motor de Score CFI**: Análise estatística que avalia margem, depreciação, riscos e atribui uma nota de **0 a 100** com recomendações claras (*COMPRAR*, *NEGOCIAR* ou *NÃO COMPRAR*).

### 4. PWA Moderno e Responsivo (Progressive Web App)
* **Mobile Ready**: Layout adaptável para smartphones, tablets e desktops.
* **Instalação Facilitada**: Compatível com as diretrizes do Google Lighthouse, com recursos para *Richer PWA Install UI* no Android, iOS e Windows.
* **Ícones Customizados**: Inclui suporte a ícones tradicionais e *maskable* (adaptativos).

---

## 🛠️ Stack Tecnológica

* **Core**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/)
* **Estilização**: Vanilla CSS Modules (Layout dark/light premium de alta qualidade)
* **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) (Dockerizado localmente)
* **ORM**: [Prisma Client v7](https://www.prisma.io/) (com Connection Pooling via Driver Adapter `@prisma/adapter-pg`)
* **Autenticação**: [Firebase Auth Client SDK v12](https://firebase.google.com/) (Integração com Login via Google)
* **Ícones**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Como Configurar e Rodar o Projeto Localmente

### Pré-requisitos
* **Node.js** (v18 ou superior)
* **Docker & Docker Compose** (instalado e rodando)

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/pedroreeis/car-flip-intelligence.git
cd car-flip-intelligence
```

### Passo 2: Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e preencha as credenciais:
```bash
cp .env.example .env
```
> [!IMPORTANT]
> Certifique-se de preencher as variáveis do Firebase Auth com as credenciais reais do seu console do Firebase (Google Sign-In ativado).

### Passo 3: Subir o Banco de Dados (Docker)
Suba a instância do PostgreSQL configurada no `docker-compose.yml`:
```bash
docker-compose up -d
```

### Passo 4: Instalar as Dependências e Gerar o Prisma Client
```bash
npm install
npx prisma generate
npx prisma db push
```

### Passo 5: Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O app estará disponível em: [http://localhost:3000](http://localhost:3000).

---

## 🧪 Script de Limpeza (Database Wipe)

Caso precise resetar todos os dados para um novo ciclo limpo de testes, a plataforma possui um script utilitário de deleção em cascata segura:
```bash
node scripts/wipe.js
```
Este script remove todas as transações, despesas, registros de vendas e avaliações do banco de dados local mantendo o schema intacto.

---

## ☁️ Guia de Deploy em Produção (Alternativas Gratuitas/Acessíveis)

Se você deseja hospedar a plataforma na nuvem de forma gratuita ou barata para uso particular, aqui estão as melhores opções:

### 1. Frontend & API (Next.js)
* **[Vercel](https://vercel.com/) (Gratuito)**: Hospedagem oficial do Next.js. Integração contínua direta com o GitHub.
* **[Render](https://render.com/) ou [Railway](https://railway.app/)**: Permitem hospedar aplicações Next.js de forma simples (Render tem camada gratuita; Railway oferece créditos iniciais acessíveis).

### 2. Banco de Dados PostgreSQL (Nuvem)
* **[Supabase](https://supabase.com/) (Plano Gratuito)**: Fornece uma base de dados PostgreSQL dedicada de graça (limite de 500MB, mais que suficiente para uso pessoal de arbitragem).
* **[Neon](https://neon.tech/) (Plano Gratuito)**: Provedor de Postgres serverless fantástico com excelente camada gratuita.

### 3. Autenticação (Firebase Auth)
* **[Firebase Auth](https://firebase.google.com/) (Plano Spark - Gratuito)**: A camada gratuita do Firebase Authentication cobre até 50.000 usuários ativos mensais, sem custos adicionais para o login via Google.

---

## 📄 Licença

Este projeto é desenvolvido para fins internos de gerenciamento de estoque e arbitragem automotiva. Todos os direitos reservados.
