import { useState, useEffect } from 'react'
import './App.css'
import HydrationCard from './HydrationCard'
import DateSelector from './DateSelector'
import RoutineChecklist from './RoutineChecklist'
import ProgressCard from './ProgressCard'
import AddRoutineModal from './AddRoutineModal'
import { Plus, ListTodo, Wallet } from 'lucide-react'
import FinancesScreen from './FinancesScreen'

const API_URL = window.location.hostname === 'localhost' 
  ? `http://${window.location.hostname}:8000/api`
  : `${window.location.origin}/_/backend/api`;

function getDateKey(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [routineCatalog, setRoutineCatalog] = useState([]);
  const [hydration, setHydration] = useState({ id: null, consumed: 0, goal: 2000 });
  const [dailyRoutines, setDailyRoutines] = useState([]);

  const dateKey = getDateKey(currentDate);

  const fetchDayData = () => {
    fetch(`${API_URL}/hydration/today/?date=${dateKey}`)
      .then(res => res.json())
      .then(data => setHydration(data))
      .catch(err => console.log('Backend not available yet', err));

    fetch(`${API_URL}/logs/daily/?date=${dateKey}`)
      .then(res => res.json())
      .then(data => {
        setDailyRoutines(data.map(log => ({
          log_id: log.id,
          id: log.routine,
          name: log.routine_name,
          time: log.routine_time,
          icon: log.routine_icon,
          completed: log.completed,
          notes: log.notes
        })));
      })
      .catch(err => console.log('Backend err', err));
  };

  const fetchCatalog = () => {
    fetch(`${API_URL}/routines/`)
      .then(res => res.json())
      .then(data => setRoutineCatalog(data))
      .catch(err => {});
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
    await fetch(`${API_URL}/hydration/${hydration.id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumed: newConsumed })
    });
    fetchDayData();
  };

  const handleResetDrink = async () => {
    if (!hydration.id) return;
    await fetch(`${API_URL}/hydration/${hydration.id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumed: 0 })
    });
    fetchDayData();
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
    await fetch(`${API_URL}/logs/${r.log_id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !r.completed })
    });
    fetchDayData();
  };

  const handleDeleteRoutine = async (id) => {
    const r = dailyRoutines.find(x => x.id === id);
    if (!r) return;
    await fetch(`${API_URL}/logs/${r.log_id}/`, {
      method: 'DELETE'
    });
    fetchDayData();
  };

  const handleUpdateRoutineNotes = async (id) => {
    const r = dailyRoutines.find(x => x.id === id);
    if (!r) return;
    const newNote = window.prompt("Observação/Nota da Rotina:", r.notes || "");
    if (newNote !== null) {
      await fetch(`${API_URL}/logs/${r.log_id}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNote.trim() })
      });
      fetchDayData();
    }
  };

  const handleEditRoutine = async (id) => {
    const r = dailyRoutines.find(x => x.id === id);
    if (!r) return;
    setEditingRoutine(r);
    setNewRoutineName(r.name);
    setNewRoutineTime(r.time || '');
    setNewRoutineIcon(r.icon || '');
    setIsModalOpen(true);
  };

  const handleAddRoutine = async (data) => {
    const routineData = { 
      name: data.name || newRoutineName, 
      time: data.time || newRoutineTime || null,
      icon: data.icon || newRoutineIcon || null
    };

    if (!routineData.name) return;

    const res = await fetch(`${API_URL}/routines/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routineData)
    });
    const routine = await res.json();

    // Create log for today
    await fetch(`${API_URL}/logs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routine: routine.id, date: dateKey })
    });

    setNewRoutineName('');
    setNewRoutineTime('');
    setNewRoutineIcon('');
    setIsModalOpen(false);
    fetchDayData();
    fetchCatalog();
  };

  const handleSaveRoutine = async () => {
    if (!newRoutineName || !editingRoutine) return;
    await fetch(`${API_URL}/routines/${editingRoutine.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newRoutineName, 
        time: newRoutineTime || null,
        icon: newRoutineIcon || null
      })
    });
    setEditingRoutine(null);
    setNewRoutineName('');
    setNewRoutineTime('');
    setNewRoutineIcon('');
    setIsModalOpen(false);
    fetchDayData();
  };

  const handleDeleteFromCatalog = async (id) => {
    if (window.confirm("Excluir esta rotina definitivamente do seu catálogo?")) {
      await fetch(`${API_URL}/routines/${id}/`, { method: 'DELETE' });
      fetchCatalog();
      fetchDayData(); // Refresh daily list in case it was there
    }
  };

  const completedCount = dailyRoutines.filter(r => r.completed).length;
  const totalCount = dailyRoutines.length;

  const [activeTab, setActiveTab] = useState('routines');

  return (
    <div className={`app-container ${activeTab === 'routines' ? 'theme-blue' : ''}`} style={activeTab === 'routines' ? { background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)', minHeight: '100vh' } : {}}>
      {activeTab === 'routines' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <HydrationCard 
            consumed={hydration.consumed} 
            goal={hydration.goal} 
            onDrink={handleDrink} 
            onEditGoal={handleEditGoal}
            onReset={handleResetDrink}
          />

          <DateSelector date={currentDate} onPrev={handlePrevDay} onNext={handleNextDay} />

          <div className="routines-section" style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.6)' }}>
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
            />
          </div>

          <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '20px', borderRadius: '24px' }}>
            <ProgressCard total={totalCount} completed={completedCount} />
          </div>
        </div>
      ) : (
        <FinancesScreen 
          API_URL={API_URL} 
          dateKey={dateKey} 
          onPrevMonth={handlePrevMonth} 
          onNextMonth={handleNextMonth} 
        />
      )}

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={() => setActiveTab('routines')}
        >
          <div className="nav-icon-container">
            <ListTodo size={24} />
          </div>
          <span>Rotinas</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'finances' ? 'active' : ''}`}
          onClick={() => setActiveTab('finances')}
        >
          <div className="nav-icon-container">
            <Wallet size={24} />
          </div>
          <span>Finanças</span>
        </button>
      </nav>

      <AddRoutineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddRoutine} 
        catalog={routineCatalog}
        onDeleteFromCatalog={handleDeleteFromCatalog}
      />
    </div>
  )
}

export default App
