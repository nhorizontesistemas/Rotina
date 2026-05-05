# Rotina - Gestao de Rotina, Financas e Planejamento

Aplicacao full-stack para organizar rotina diaria, hidratacao, financas, viagem, calculadora de orcamento e desafio.

Arquitetura:
- Frontend: React + Vite
- Backend: Django + Django REST Framework
- Banco: PostgreSQL (Supabase) ou SQLite (modo local)
- Orquestracao: Docker Compose

## Sumario
- Visao geral
- Funcionalidades
- Arquitetura e stack
- Estrutura do projeto
- Pre-requisitos
- Configuracao de ambiente
- Como executar (Docker)
- Como executar (sem Docker)
- Rotas de navegacao (frontend)
- API (backend)
- Modelos principais
- Deploy (Vercel)
- Solucao de problemas
- Proximos passos sugeridos

## Visao geral
O sistema foi desenhado para uso diario, com foco em produtividade pessoal:
- acompanhar habitos e conclusao do dia
- controlar consumo de agua
- registrar ganhos e gastos por mes
- planejar viagem com roteiro, acomodacao e custos
- simular distribuicao de orcamento e dividas
- acompanhar desafio com marcacoes e notas

## Funcionalidades
### 1. Rotinas e hidratacao
- catalogo de rotinas
- checklist diario por data
- reorder por drag-and-drop com persistencia no campo order
- notas por rotina do dia
- meta de hidratacao por dia com controle de consumo

### 2. Financas
- lancamentos por categoria: EARNING, FIXED_EXPENSE e DAILY_EXPENSE
- visao mensal
- replicacao automatica de gastos fixos do mes anterior para um novo mes

### 3. Viagem
- plano de viagem (destino, datas e custos)
- itens de combo
- itens de roteiro (com data/hora, ordem, status e valores)
- itens de acomodacao (com check-in/check-out, ordem, status e valores)

### 4. Calculadora de orcamento
- cadastro de orcamento total
- cadastro de dividas vinculadas ao orcamento

### 5. Desafio
- geracao automatica de itens numerados
- marcacao, notas e cor (green/yellow/red)
- endpoint para reset geral

## Arquitetura e stack
### Frontend
- React 18
- Vite 5
- Lucide React
- CSS (sem framework)

### Backend
- Django 4.2
- Django REST Framework
- django-cors-headers
- django-environ
- psycopg2-binary

## Estrutura do projeto
```text
.
|-- backend/
|   |-- core/
|   |   |-- settings.py
|   |   |-- urls.py
|   |-- routine_app/
|   |   |-- models.py
|   |   |-- serializers.py
|   |   |-- urls.py
|   |   |-- views.py
|   |-- manage.py
|   |-- requirements.txt
|-- frontend/
|   |-- public/
|   |   |-- assets/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- RoutineChecklist.jsx
|   |   |-- FinancesScreen.jsx
|   |   |-- TravelScreen.jsx
|   |   |-- CalculatorScreen.jsx
|   |   |-- DesafioScreen.jsx
|   |-- index.html
|   |-- package.json
|-- docker-compose.yml
|-- vercel.json
|-- README.md
```

## Pre-requisitos
Para Docker:
- Docker
- Docker Compose

Para execucao local sem Docker:
- Python 3.11+
- Node.js 18+
- npm

## Configuracao de ambiente
### Backend (.env)
Crie backend/.env com a variavel:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

Observacoes:
- o backend pode usar SQLite quando DJANGO_USE_SQLITE=1
- quando DJANGO_USE_SQLITE nao estiver ativo, o backend usa DATABASE_URL
- se DATABASE_URL nao existir, existe fallback para SQLite em settings

### Frontend (.env opcional)
No frontend, voce pode definir:

```env
VITE_API_URL=http://localhost:8001/api
```

Se nao definir VITE_API_URL, o frontend detecta automaticamente:
- local: http://<host>:8001/api
- producao (Vercel services): <origin>/_/backend/api

## Como executar (Docker)
Na raiz do projeto:

```bash
docker compose up --build
```

Servicos:
- frontend: http://localhost:5173
- backend: http://localhost:8001
- API root: http://localhost:8001/api/

Comandos uteis:

```bash
docker compose down
docker compose logs -f backend
docker compose logs -f frontend
docker compose up -d --build --force-recreate backend
```

## Como executar (sem Docker)
### Backend
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
python manage.py makemigrations routine_app
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host
```

## Rotas de navegacao (frontend)
Navegacao via hash em App.jsx:
- #/rotinas
- #/financas
- #/viagem
- #/calculadora
- #/desafio

## API (backend)
Base URL:
- /api/

Recursos DRF (router):
- /api/hydration/
- /api/routines/
- /api/logs/
- /api/transactions/
- /api/travel-plans/
- /api/travel-combo-items/
- /api/travel-itinerary-items/
- /api/travel-accommodation-items/
- /api/budget-calculators/
- /api/budget-debts/
- /api/desafio/

Acoes customizadas:
- GET /api/hydration/today/?date=YYYY-MM-DD
- GET /api/logs/daily/?date=YYYY-MM-DD
- GET /api/transactions/by_date/?date=YYYY-MM-DD
- GET /api/transactions/by_month/?date=YYYY-MM-DD
- POST /api/desafio/reset_all/

Exemplos rapidos:

```bash
# hidracao do dia
curl "http://localhost:8001/api/hydration/today/?date=2026-05-04"

# logs diarios
curl "http://localhost:8001/api/logs/daily/?date=2026-05-04"
```

## Modelos principais
- Hydration: controle diario de meta e consumo
- Routine: catalogo de habitos
- RoutineLog: estado da rotina por dia (completed, notes, order)
- Transaction: lancamentos financeiros
- MonthlyFinanceState: controle de inicializacao mensal para replicacao
- TravelPlan, TravelComboItem, TravelItineraryItem, TravelAccommodationItem
- BudgetCalculator e BudgetDebt
- DesafioItem

## Deploy (Vercel)
Existe configuracao em vercel.json com experimentalServices:
- frontend em /
- backend em /_/backend

No frontend, a API em producao e resolvida para:
- <origin>/_/backend/api

## Solucao de problemas
### 1. Backend nao conecta no Supabase
Checklist:
- validar DATABASE_URL em backend/.env
- testar conectividade da porta (ex.: 6543)
- evitar fixar extra_hosts com IP antigo no docker-compose.yml
- recriar o backend apos alteracoes:

```bash
docker compose up -d --build --force-recreate backend
```

### 2. Frontend sem dados
- confirmar API em http://localhost:8001/api/
- validar VITE_API_URL se definido
- verificar logs do backend

### 3. Favicon da aba
Configurado em frontend/index.html para:
- /assets/routine_sticker.png

## Proximos passos sugeridos
- adicionar autenticacao e permissao por usuario
- adicionar testes automatizados (backend e frontend)
- adicionar CI para lint, build e testes
- separar configuracoes de desenvolvimento e producao
