import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ArrowUpCircle, ArrowDownCircle, Calendar, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

export default function FinancesScreen({ API_URL, dateKey, onPrevMonth, onNextMonth }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('DAILY_EXPENSE');
  const [transactionDate, setTransactionDate] = useState(dateKey);

  const fetchTransactions = () => {
    fetch(`${API_URL}/transactions/by_month/?date=${dateKey}`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTransactions();
    setTransactionDate(dateKey);
  }, [dateKey]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    await fetch(`${API_URL}/transactions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        amount: parseFloat(amount),
        category,
        date: transactionDate,
        icon: icon || null,
        is_completed: false
      })
    });

    setDescription('');
    setAmount('');
    setIcon('');
    fetchTransactions();
  };

  const handleToggle = async (t) => {
    await fetch(`${API_URL}/transactions/${t.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: !t.is_completed })
    });
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/transactions/${id}/`, { method: 'DELETE' });
    fetchTransactions();
  };

  const handleUpdateNotes = async (t) => {
    const newNote = window.prompt("Observação/Nota:", t.notes || "");
    if (newNote !== null) {
      await fetch(`${API_URL}/transactions/${t.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNote.trim() })
      });
      fetchTransactions();
    }
  };

  const earnings = transactions.filter(t => t.category === 'EARNING');
  const fixedExpenses = transactions.filter(t => t.category === 'FIXED_EXPENSE');
  const dailyExpenses = transactions.filter(t => t.category === 'DAILY_EXPENSE');

  const totalEarnings = earnings.filter(t => t.is_completed).reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalFixedExpenses = fixedExpenses.filter(t => t.is_completed).reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalDailyExpenses = dailyExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = totalEarnings - totalFixedExpenses - totalDailyExpenses;

  const monthName = new Date(dateKey + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="finances-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px', padding: '10px', borderRadius: '24px', background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '5px' }}>
        <button onClick={onPrevMonth} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: '10px' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '18px', textTransform: 'capitalize', color: 'var(--text-main)', width: '160px', textAlign: 'center', fontWeight: '700' }}>
          {monthName}
        </h2>
        <button onClick={onNextMonth} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: '10px' }}>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* BALANCE CARD (MONTHLY) - NOW GREEN */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white', padding: '24px', border: 'none', boxShadow: '0 10px 20px rgba(5, 150, 105, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ opacity: 0.9, fontSize: '13px', fontWeight: '600', color: '#ecfdf5' }}>⚖️ SALDO ACUMULADO</p>
            <h2 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px' }}>R$ {balance.toFixed(2)}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', opacity: 0.9 }}>Ganhos: + {totalEarnings.toFixed(2)}</p>
            <p style={{ fontSize: '12px', opacity: 0.9 }}>Gastos: - {(totalFixedExpenses + totalDailyExpenses).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="card shadow-md" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--text-main)', fontSize: '16px' }}>📝 Adicionar Lançamento</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="💰" 
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="input-field"
              style={{ ...styles.input, width: '45px', textAlign: 'center', fontSize: '20px' }}
              maxLength={2}
            />
            <input 
              type="text" 
              placeholder="Descrição" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field"
              style={{ ...styles.input, flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="number" 
              placeholder="R$ 0,00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-field"
              style={{ ...styles.input, flex: '1 1 120px' }}
            />
            <input 
              type="date" 
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
              className="input-field"
              style={{ ...styles.input, flex: '1 1 140px' }}
            />
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              style={{ ...styles.input, flex: '1 1 140px' }}
            >
              <option value="EARNING">Ganho</option>
              <option value="FIXED_EXPENSE">Gasto Fixo</option>
              <option value="DAILY_EXPENSE">Gasto Diário</option>
            </select>
          </div>
          <button type="submit" className="drink-btn" style={{ width: '100%', borderRadius: '12px', background: '#10b981', border: 'none', color: 'white' }}>
            <Plus size={20} /> Salvar no Mês
          </button>
        </form>
      </div>

      <FinanceSection 
        title="Histórico de Ganhos" 
        items={earnings} 
        onToggle={handleToggle} 
        onDelete={handleDelete} 
        onUpdateNotes={handleUpdateNotes}
        color="#10b981" 
        showCheck={true}
      />
      
      <FinanceSection 
        title="Gastos Fixos" 
        items={fixedExpenses} 
        onToggle={handleToggle} 
        onDelete={handleDelete} 
        onUpdateNotes={handleUpdateNotes}
        color="#f59e0b" 
        showCheck={true}
      />

      <FinanceSection 
        title="Gastos Diários" 
        items={dailyExpenses} 
        onToggle={handleToggle}
        onDelete={handleDelete} 
        onUpdateNotes={handleUpdateNotes}
        color="#ef4444" 
        showCheck={false}
      />

    </div>
  );
}

function FinanceSection({ title, items, onToggle, onDelete, onUpdateNotes, color, showCheck, defaultIcon }) {
  return (
    <div className="finance-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 5px' }}>
        <h4 style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>{title}</h4>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{items.length} itens</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map(item => (
          <div key={item.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: `5px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {showCheck ? (
                  <div onClick={(e) => { e.stopPropagation(); onToggle(item); }} style={{ cursor: 'pointer', color: item.is_completed ? color : '#cbd5e1' }}>
                    {item.is_completed ? <CheckCircle size={22} fill={color} color="white" /> : <Circle size={22} />}
                  </div>
                ) : (
                  <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowDownCircle size={20} color={color} />
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)', textDecoration: item.is_completed ? 'line-through' : 'none', opacity: item.is_completed ? 0.6 : 1 }}>
                    <span style={{ marginRight: '8px' }}>{item.icon || defaultIcon || '✨'}</span>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>R$ {parseFloat(item.amount).toFixed(2)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                      {item.date === new Date().toISOString().split('T')[0] ? 'Hoje' : `Dia ${new Date(item.date + 'T12:00:00').getDate()}`}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateNotes(item); }} 
                  style={{ background: 'none', border: 'none', color: item.notes ? '#10b981' : '#94a3b8', cursor: 'pointer', padding: '5px' }}
                >
                  <MessageSquare size={16} fill={item.notes ? 'rgba(16, 185, 129, 0.1)' : 'none'} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '5px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {item.notes && (
              <div style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#065f46', fontStyle: 'italic', border: '1px solid #d1fae5' }}>
                "{item.notes}"
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>Nenhum registro este mês.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  input: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    background: '#f8fafc'
  }
};
