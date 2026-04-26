# Rotina Diárias — System Overview

Personal management web app. 4 main modules: rotinas, finanças, viagem, calculadora.

## Stack

**Frontend:** React 18 + Vite 5 — `frontend/src/`
**Backend:** Django 4 + Django REST Framework — `backend/routine_app/`
**Database:** PostgreSQL via Supabase (sa-east-1)
**Container:** Docker Compose (recommended way to run)
**Language/TZ:** pt-BR, America/São_Paulo

## Run

```bash
docker-compose up
# frontend → http://localhost:5173
# backend API → http://localhost:8001/api
```

Manual:
```bash
# backend
cd backend && pip install -r requirements.txt
python manage.py migrate && python manage.py runserver

# frontend
cd frontend && npm install && npm run dev
```

## Modules

### Rotinas
- Checklist diário de tarefas com nome, horário, ícone, cor
- Marca conclusão, adiciona nota, navega por data
- `RoutineChecklist.jsx`, `AddRoutineModal.jsx`
- Models: `Routine`, `RoutineLog`

### Finanças
- Categorias: EARNING, FIXED_EXPENSE, DAILY_EXPENSE
- Visão mensal, navegação por data
- Auto-replica gastos fixos do mês anterior para mês novo
- Catálogo de transações recorrentes
- `FinancesScreen.jsx`
- Models: `Transaction`, `MonthlyFinanceState`

### Viagem
- Planos de viagem: destino, datas, transporte (carro/ônibus/avião/van/outro), distância
- Custos: pedágio, combustível, hospedagem
- Roteiro dia a dia: refeições, atrações, compras — com custo previsto vs. real
- Hospedagem com check-in/check-out por tipo (hotel, chácara, apartamento, pousada, hostel, casa)
- Combo de atividades pré-planejadas
- `TravelScreen.jsx` (arquivo maior do projeto, ~86KB)
- Models: `TravelPlan`, `TravelComboItem`, `TravelItineraryItem`, `TravelAccommodationItem`

### Calculadora
- Projetos de orçamento com valor total
- Rastreia dívidas/gastos dentro de cada orçamento
- `CalculatorScreen.jsx`
- Models: `BudgetCalculator`, `BudgetDebt`

### Hidratação
- Tracker de consumo de água (meta: 2000ml/dia)
- `HydrationCard.jsx`
- Model: `Hydration`

## Estrutura de Pastas

```
Rotina/
├── backend/
│   ├── core/              # settings.py, urls.py
│   └── routine_app/       # models.py, views.py, serializers.py, urls.py, migrations/
├── frontend/
│   └── src/               # App.jsx (roteamento de abas), *.jsx (telas e componentes)
├── docker-compose.yml
└── vercel.json            # deploy
```

## API (base: /api/)

| Resource | Endpoints notáveis |
|---|---|
| `hydration/` | GET today/?date= |
| `routines/` | CRUD |
| `logs/` | daily/?date= |
| `transactions/` | by_date/?date=, by_month/?date= |
| `travel-plans/` | CRUD |
| `travel-combo-items/` | CRUD |
| `travel-itinerary-items/` | CRUD |
| `travel-accommodation-items/` | CRUD |
| `budget-calculators/` | CRUD |
| `budget-debts/` | CRUD |

## Config

- `backend/.env` — DATABASE_URL (Supabase)
- `frontend/.env.development` — `VITE_API_URL=http://localhost:8001/api`
- Frontend auto-detecta ambiente (localhost / IP privado / produção) para URL da API
- CORS aberto no backend (desenvolvimento)
- Docker Compose roda migrations automaticamente no startup
