# Sistema de Gestão de Rotina e Planejamento Personalizado

Este sistema é uma aplicação completa para gestão de hábitos diários, finanças pessoais, planejamento de viagens e acompanhamento de desafios. Foi projetado com uma arquitetura moderna separando Frontend (React) e Backend (Django).

## 🚀 Arquitetura e Tech Stack

- **Frontend:** React.js + Vite. Utiliza CSS Vanilla para estilização premium e Lucide-React para iconografia.
- **Backend:** Django (Python) com Django REST Framework (DRF) para APIs.
- **Banco de Dados:** SQLite (padrão) com suporte a migrações Django.
- **Containerização:** Docker e Docker Compose para orquestração de serviços.

---

## 🛠️ Módulos do Sistema

### 1. Rotinas e Hidratação (`/rotinas`)
- **Checklist Diário:** Permite criar rotinas no catálogo e registrá-las diariamente.
- **Ordenação Customizada:** Suporta arrastar e soltar (drag-and-drop) para definir a ordem das tarefas, persistida via campo `order` no `RoutineLog`.
- **Hidratação:** Controle de consumo de água com meta diária configurável.
- **Progresso:** Card visual que mostra a porcentagem de conclusão das tarefas do dia.

### 2. Finanças (`/financas`)
- **Transações:** Registro de Ganhos, Gastos Fixos e Gastos Diários.
- **Fluxo Mensal:** O sistema organiza as finanças por mês/ano, permitindo navegação no histórico.
- **Resumo:** Cálculo automático de saldo, total de gastos e economia prevista.

### 3. Planejador de Viagem (`/viagem`) - *Módulo Avançado*
- **Cálculo de Rota:** Integração com APIs de geocodificação e roteamento (Nominatim/OSRM) para calcular distância e custo de combustível.
- **Gestão de Custos:** Soma automática de pedágios, combustível, acomodações e itens do roteiro.
- **Roteiro e Acomodações:** 
  - Suporta múltiplos itens por dia.
  - **Ordenação Manual:** Implementação de drag-and-drop que persiste no banco de dados através do campo `order`.
  - Diferenciação visual entre itens concluídos e pendentes.

### 4. Calculadora de Orçamento (`/calculadora`)
- Ferramenta para simulação de dívidas e distribuição de orçamento total.

### 5. Desafio (`/desafio`)
- Grid interativo para acompanhamento de metas de longo prazo (ex: 100 dias), com sistema de cores (Verde, Amarelo, Vermelho) e notas por item.

---

## 📂 Estrutura de Pastas

```text
/
├── frontend/             # Código React (Vite)
│   ├── src/
│   │   ├── App.jsx       # Componente principal e roteamento por Hash
│   │   ├── TravelScreen.jsx # Lógica complexa de viagens e ordenação
│   │   └── ...           # Componentes modulares (Finances, Routine, etc)
├── backend/              # Código Django (Python)
│   ├── routine_app/      # App principal com Models e Views
│   │   ├── models.py     # Definição do banco de dados (crucial para entender o sistema)
│   │   └── views.py      # Endpoints da API
└── docker-compose.yml    # Configuração para rodar todo o sistema
```

---

## 📋 Informações para a próxima IA / Desenvolvedor

### Regras de Ordenação (Drag-and-Drop)
- O sistema utiliza uma lógica de `order` nos modelos `RoutineLog`, `TravelItineraryItem` e `TravelAccommodationItem`.
- No Frontend, a função `sortByDateTime` no arquivo `TravelScreen.jsx` é a responsável por garantir que a ordem visual corresponda aos dados. Ela prioriza `Data` -> `Ordem Manual` -> `Hora`.
- Sempre que houver um reordenamento na interface, o Frontend dispara múltiplos `PATCH` para atualizar o campo `order` no banco de dados.

### Comunicação com API
- A URL da API é detectada automaticamente entre `localhost` (ambiente dev) e o host de produção.
- O sistema utiliza `fetch` padrão para operações CRUD.

### Ambiente de Desenvolvimento
- Para rodar o sistema completo: `docker-compose up --build`
- Backend roda na porta `8001`.
- Frontend roda na porta `5173`.

---

## 📝 Notas de Versão Recentes
- Implementada a persistência de ordem no módulo de Viagens.
- Corrigida a lógica de sincronização entre o estado visual do React e o banco de dados Django durante o arrasto de itens.
- Adicionado suporte a metas de consumo de água persistentes por data.
