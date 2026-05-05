import { useState, useEffect } from 'react'
import './App.css'
import HydrationCard from './HydrationCard'
import DateSelector from './DateSelector'
import RoutineChecklist from './RoutineChecklist'
import ProgressCard from './ProgressCard'
import AddRoutineModal from './AddRoutineModal'
import FinancesScreen from './FinancesScreen'
import TravelScreen from './TravelScreen'
import CalculatorScreen from './CalculatorScreen'
import DesafioScreen from './DesafioScreen'
import { Plus, ListTodo, Wallet, Plane, Calculator, Trophy } from 'lucide-react'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const isPrivateIpv4 = /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(window.location.hostname);
const isLocalEnvironment = LOCAL_HOSTS.has(window.location.hostname) || isPrivateIpv4;
const apiFromEnv = import.meta.env.VITE_API_URL;

const API_URL = apiFromEnv || (isLocalEnvironment
  ? `http://${window.location.hostname}:8001/api`
  : `${window.location.origin}/_/backend/api`);

function getDateKey(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return (hours * 60) + minutes;
}

function hasCustomOrder(routines) {
  return routines.some(r => r.order !== 0 && r.order !== undefined && r.order !== null);
}

function sortRoutines(routines) {
  if (hasCustomOrder(routines)) {
    return [...routines].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  return [...routines].sort((a, b) => {
    const aMinutes = timeToMinutes(a.time);
    const bMinutes = timeToMinutes(b.time);

    if (aMinutes === null && bMinutes === null) {
      return a.name.localeCompare(b.name, 'pt-BR');
    }
    if (aMinutes === null) return 1;
    if (bMinutes === null) return -1;
    return aMinutes - bMinutes;
  });
}

const HASH_BY_TAB = {
  routines: '#/rotinas',
  finances: '#/financas',
  travel: '#/viagem',
  calculator: '#/calculadora',
  desafio: '#/desafio'
};

function getTabFromHash(hash) {
  const cleanHash = (hash || '').toLowerCase();
  if (cleanHash === '#/financas') return 'finances';
  if (cleanHash === '#/viagem') return 'travel';
  if (cleanHash === '#/calculadora') return 'calculator';
  if (cleanHash === '#/desafio') return 'desafio';
  return 'routines';
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [routineCatalog, setRoutineCatalog] = useState([]);
  const [hydration, setHydration] = useState({ id: null, consumed: 0, goal: 3000 });
  const [dailyRoutines, setDailyRoutines] = useState([]);
  
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('');
  const [newRoutineIcon, setNewRoutineIcon] = useState('');
  const [newRoutineColor, setNewRoutineColor] = useState('#2563eb');
  const [editingRoutine, setEditingRoutine] = useState(null);

  const dateKey = getDateKey(currentDate);

  const fetchDayData = () => {
    console.log('Buscando dados do dia - dateKey:', dateKey, 'API_URL:', API_URL);
    
    fetch(`${API_URL}/hydration/today/?date=${dateKey}`)
      .then(res => res.json())
      .then(data => {
        console.log('Dados de hidratação:', data);
        setHydration(data);
      })
      .catch(err => console.error('Erro ao buscar hidratação:', err));

    fetch(`${API_URL}/logs/daily/?date=${dateKey}`)
      .then(res => res.json())
      .then(data => {
        console.log('Logs do dia:', data);
        const mappedRoutines = data.map(log => ({
          log_id: log.id,
          id: log.routine,
          name: log.routine_name,
          time: log.routine_time,
          icon: log.routine_icon,
          color: log.routine_color,
          completed: log.completed,
          notes: log.notes
        }));

        setDailyRoutines(sortRoutines(mappedRoutines));
      })
      .catch(err => console.error('Erro ao buscar logs:', err));
  };

  const fetchCatalog = () => {
    fetch(`${API_URL}/routines/`)
      .then(res => res.json())
      .then(data => {
        console.log('Catálogo carregado:', data);
        setRoutineCatalog(data);
      })
      .catch(err => {
        console.error('Erro ao carregar catálogo:', err);
      });
  };

  useEffect(() => {
    fetchDayData();
    fetchCatalog();
  }, [dateKey]);

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const handleDrink = async (amount) => {
    if (!hydration.id) return;
    const newConsumed = Math.min(hydration.consumed + amount, hydration.goal);
    const previousHydration = hydration;

    setHydration(prev => ({ ...prev, consumed: newConsumed }));

    const response = await fetch(`${API_URL}/hydration/${hydration.id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumed: newConsumed })
    });

    if (!response.ok) {
      setHydration(previousHydration);
      fetchDayData();
    }
  };

  const handleResetDrink = async () => {
    if (!hydration.id) return;
    const previousHydration = hydration;

    setHydration(prev => ({ ...prev, consumed: 0 }));

    const response = await fetch(`${API_URL}/hydration/${hydration.id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumed: 0 })
    });

    if (!response.ok) {
      setHydration(previousHydration);
      fetchDayData();
    }
  };

  const handleEditGoal = async () => {
    if (!hydration.id) return;
    const newGoalStr = window.prompt("Nova meta de água diária (ml):", hydration.goal);
    if (newGoalStr !== null) {
      const newGoal = parseInt(newGoalStr, 10);
      if (!isNaN(newGoal) && newGoal > 0) {
        await fetch(`${API_URL}/hydration/${hydration.id}/`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: newGoal })
        });
        fetchDayData();
      }
    }
  };

  const handleToggleRoutine = async (id) => {
    const r = dailyRoutines.find(x => x.id === id);
    if (!r) return;
    const nextCompleted = !r.completed;

    setDailyRoutines(prev => prev.map(item => (
      item.id === id ? { ...item, completed: nextCompleted } : item
    )));

    const response = await fetch(`${API_URL}/logs/${r.log_id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: nextCompleted })
    });

    if (!response.ok) {
      setDailyRoutines(prev => prev.map(item => (
        item.id === id ? { ...item, completed: r.completed } : item
      )));
      fetchDayData();
    }
  };

  const handleDeleteRoutine = async (id) => {
    const r = dailyRoutines.find(x => x.id === id);
    if (!r) return;
    const previousRoutines = dailyRoutines;
    setDailyRoutines(prev => prev.filter(item => item.id !== id));

    const response = await fetch(`${API_URL}/logs/${r.log_id}/`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      setDailyRoutines(previousRoutines);
      fetchDayData();
    }
  };

  const handleUpdateRoutineNotes = async (id) => {
    const r = dailyRoutines.find(x => x.id === id);
    if (!r) return;
    const newNote = window.prompt("Observação/Nota da Rotina:", r.notes || "");
    if (newNote !== null) {
      const trimmedNote = newNote.trim();
      const previousNote = r.notes;

      setDailyRoutines(prev => prev.map(item => (
        item.id === id ? { ...item, notes: trimmedNote } : item
      )));

      const response = await fetch(`${API_URL}/logs/${r.log_id}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: trimmedNote })
      });

      if (!response.ok) {
        setDailyRoutines(prev => prev.map(item => (
          item.id === id ? { ...item, notes: previousNote } : item
        )));
        fetchDayData();
      }
    }
  };

  const handleReorderRoutines = async (reorderedRoutines) => {
    setDailyRoutines(reorderedRoutines);

    for (let i = 0; i < reorderedRoutines.length; i++) {
      const routine = reorderedRoutines[i];
      const response = await fetch(`${API_URL}/logs/${routine.log_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: i })
      });

      if (!response.ok) {
        console.error(`Erro ao atualizar ordem para rotina ${routine.id}`);
        fetchDayData();
        return;
      }
    }
  };

  const handleEditRoutine = async (id) => {
    const r = dailyRoutines.find(x => x.id === id);
    if (!r) return;
    setEditingRoutine(r);
    setNewRoutineName(r.name);
    setNewRoutineTime(r.time || '');
    setNewRoutineIcon(r.icon || '');
    setNewRoutineColor(r.color || '#2563eb');
    setIsModalOpen(true);
  };

  const handleAddRoutine = async (data) => {
    console.log('Adicionando rotina, data:', data);
    const routineData = { 
      name: data.name || newRoutineName, 
      time: data.time || newRoutineTime || null,
      icon: data.icon || newRoutineIcon || null,
      color: data.color || newRoutineColor || null
    };

    console.log('routineData para POST:', routineData);

    if (!routineData.name) {
      console.log('Nome vazio, retornando');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/routines/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routineData)
      });
      
      if (!res.ok) {
        console.error('Erro na resposta:', res.status, res.statusText);
        return;
      }
      
      const routine = await res.json();
      console.log('Rotina criada:', routine);

      // Create log for today
      const logRes = await fetch(`${API_URL}/logs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routine: routine.id, date: dateKey })
      });
      
      if (!logRes.ok) {
        console.error('Erro ao criar log:', logRes.status);
        return;
      }

      const createdLog = await logRes.json();
      const newRoutineEntry = {
        log_id: createdLog.id,
        id: routine.id,
        name: routine.name,
        time: routine.time,
        icon: routine.icon,
        color: routine.color,
        completed: createdLog.completed,
        notes: createdLog.notes
      };
      
      console.log('Log criado para hoje');
      setNewRoutineName('');
      setNewRoutineTime('');
      setNewRoutineIcon('');
      setNewRoutineColor('#2563eb');
      setIsModalOpen(false);
      setDailyRoutines(prev => sortRoutines([...prev, newRoutineEntry]));
      setRoutineCatalog(prev => sortRoutines([...prev, routine]));
    } catch (error) {
      console.error('Erro ao adicionar rotina:', error);
      fetchDayData();
      fetchCatalog();
    }
  };

  const handleSaveRoutine = async (data) => {
    if (!editingRoutine) return;
    
    const routineData = { 
      name: data.name || newRoutineName, 
      time: data.time || newRoutineTime || null,
      icon: data.icon || newRoutineIcon || null,
      color: data.color || newRoutineColor || null
    };

    if (!routineData.name) return;

    const response = await fetch(`${API_URL}/routines/${editingRoutine.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routineData)
    });

    if (!response.ok) {
      fetchDayData();
      fetchCatalog();
      return;
    }

    const updatedRoutine = await response.json();

    setRoutineCatalog(prev => sortRoutines(prev.map(item => (
      item.id === updatedRoutine.id
        ? { ...item, name: updatedRoutine.name, time: updatedRoutine.time, icon: updatedRoutine.icon, color: updatedRoutine.color }
        : item
    ))));

    setDailyRoutines(prev => sortRoutines(prev.map(item => (
      item.id === updatedRoutine.id
        ? { ...item, name: updatedRoutine.name, time: updatedRoutine.time, icon: updatedRoutine.icon, color: updatedRoutine.color }
        : item
    ))));

    setEditingRoutine(null);
    setNewRoutineName('');
    setNewRoutineTime('');
    setNewRoutineIcon('');
    setNewRoutineColor('#2563eb');
    setIsModalOpen(false);
  };

  const handleDeleteFromCatalog = async (id) => {
    if (window.confirm("Excluir esta rotina definitivamente do seu catálogo?")) {
      const prevCatalog = routineCatalog;
      const prevDaily = dailyRoutines;

      setRoutineCatalog(prev => prev.filter(item => item.id !== id));
      setDailyRoutines(prev => prev.filter(item => item.id !== id));

      const response = await fetch(`${API_URL}/routines/${id}/`, { method: 'DELETE' });

      if (!response.ok) {
        setRoutineCatalog(prevCatalog);
        setDailyRoutines(prevDaily);
        fetchCatalog();
        fetchDayData();
      }
    }
  };

  const completedCount = dailyRoutines.filter(r => r.completed).length;
  const totalCount = dailyRoutines.length;

  const [activeTab, setActiveTab] = useState(() => getTabFromHash(window.location.hash));

  useEffect(() => {
    const syncTabWithHash = () => {
      setActiveTab(getTabFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', syncTabWithHash);

    const currentHash = (window.location.hash || '').toLowerCase();
    const normalizedHash = HASH_BY_TAB[getTabFromHash(currentHash)];
    if (currentHash !== normalizedHash) {
      window.history.replaceState(null, '', normalizedHash);
    }

    return () => {
      window.removeEventListener('hashchange', syncTabWithHash);
    };
  }, []);

  const handleTabChange = (tab) => {
    const targetHash = HASH_BY_TAB[tab] || HASH_BY_TAB.routines;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div
      className={`app-container ${activeTab === 'routines' ? 'theme-blue' : ''}`}
      style={
        activeTab === 'routines'
          ? { background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)', minHeight: '100vh' }
          : activeTab === 'travel'
            ? { background: 'linear-gradient(180deg, #fff7ed 0%, #f8fafc 100%)', minHeight: '100vh' }
            : activeTab === 'calculator'
              ? { background: 'linear-gradient(180deg, #f5f3ff 0%, #f8fafc 100%)', minHeight: '100vh' }
              : {}
      }
    >
      <div style={{ display: activeTab === 'routines' ? 'block' : 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <HydrationCard 
            consumed={hydration.consumed} 
            goal={hydration.goal} 
            onDrink={handleDrink} 
            onEditGoal={handleEditGoal}
            onReset={handleResetDrink}
          />

          <DateSelector date={currentDate} onPrev={handlePrevDay} onNext={handleNextDay} />

          <div className="routines-section" style={{ background: 'rgba(255,255,255,0.78)', padding: '20px', borderRadius: '24px', border: '2px dashed rgba(148,163,184,0.35)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' }}>
            <div className="section-title">
              <span>📅 Minhas Rotinas</span>
              <button className="add-btn" onClick={() => setIsModalOpen(true)} style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} /> <span>📝 Novo</span>
              </button>
            </div>
            <RoutineChecklist
              routines={dailyRoutines}
              onToggle={handleToggleRoutine}
              onDelete={handleDeleteRoutine}
              onEdit={handleEditRoutine}
              onUpdateNotes={handleUpdateRoutineNotes}
              onReorder={handleReorderRoutines}
            />
          </div>

          <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '20px', borderRadius: '24px' }}>
            <ProgressCard total={totalCount} completed={completedCount} />
          </div>
        </div>
      </div>

      <div style={{ display: activeTab === 'finances' ? 'block' : 'none' }}>
        <FinancesScreen 
          API_URL={API_URL} 
          dateKey={dateKey} 
          onPrevMonth={handlePrevMonth} 
          onNextMonth={handleNextMonth} 
        />
      </div>

      <div style={{ display: activeTab === 'travel' ? 'block' : 'none' }}>
        <TravelScreen API_URL={API_URL} />
      </div>

      <div style={{ display: activeTab === 'calculator' ? 'block' : 'none' }}>
        <CalculatorScreen API_URL={API_URL} />
      </div>

      <div style={{ display: activeTab === 'desafio' ? 'block' : 'none' }}>
        <DesafioScreen API_URL={API_URL} />
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={() => handleTabChange('routines')}
        >
          <div className="nav-icon-container">
            <ListTodo size={24} />
          </div>
          <span>Rotinas</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'finances' ? 'active' : ''}`}
          onClick={() => handleTabChange('finances')}
        >
          <div className="nav-icon-container">
            <Wallet size={24} />
          </div>
          <span>Finanças</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'travel' ? 'active' : ''}`}
          onClick={() => handleTabChange('travel')}
        >
          <div className="nav-icon-container">
            <Plane size={24} />
          </div>
          <span>Viagem</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => handleTabChange('calculator')}
        >
          <div className="nav-icon-container">
            <Calculator size={24} />
          </div>
          <span>Calculadora</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'desafio' ? 'active' : ''}`}
          onClick={() => handleTabChange('desafio')}
        >
          <div className="nav-icon-container">
            <Trophy size={24} />
          </div>
          <span>Desafio</span>
        </button>
      </nav>

      <AddRoutineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={editingRoutine ? handleSaveRoutine : handleAddRoutine} 
        catalog={routineCatalog}
        onDeleteFromCatalog={handleDeleteFromCatalog}
        initialData={editingRoutine}
      />
    </div>
  )
}

export default App
