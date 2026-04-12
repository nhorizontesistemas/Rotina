import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ArrowDownCircle, ChevronLeft, ChevronRight, MessageSquare, Edit2 } from 'lucide-react';

const STICKER_OPTIONS = [
  '💰', '💵', '💸', '💳', '🏦', '🧾', '📈', '📉',
  '🛒', '🛍️', '🍔', '☕', '⛽', '🚗', '🏠', '🎁',
  '💊', '🩺', '📚', '💼', '🧑‍💻', '🎯', '📌', '✅',
  '🔥', '✨', '⭐', '🧠', '⚡', '📅', '📝', '🔧'
];

function sortTransactions(list) {
  return [...list].sort((a, b) => {
    const dateA = new Date(`${a.date}T12:00:00`).getTime();
    const dateB = new Date(`${b.date}T12:00:00`).getTime();

    if (dateA !== dateB) return dateB - dateA;
    return b.id - a.id;
  });
}

function buildFinanceCatalog(transactions) {
  const signatureMap = new Map();

  sortTransactions(transactions).forEach((item) => {
    const signature = [
      item.description || '',
      String(item.amount || ''),
      item.category || '',
      item.icon || ''
    ].join('|');

    if (!signatureMap.has(signature)) {
      signatureMap.set(signature, {
        id: item.id,
        description: item.description,
        amount: item.amount,
        category: item.category,
        icon: item.icon || null
      });
    }
  });

  return Array.from(signatureMap.values());
}

export default function FinancesScreen({ API_URL, dateKey, onPrevMonth, onNextMonth }) {
  const [transactions, setTransactions] = useState([]);
  const [financeCatalog, setFinanceCatalog] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('DAILY_EXPENSE');
  const [transactionDate, setTransactionDate] = useState(dateKey);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editCategory, setEditCategory] = useState('DAILY_EXPENSE');
  const [editDate, setEditDate] = useState(dateKey);
  const [showEditStickerPicker, setShowEditStickerPicker] = useState(false);

  const fetchTransactions = () => {
    fetch(`${API_URL}/transactions/by_month/?date=${dateKey}`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  };

  const fetchCatalog = () => {
    fetch(`${API_URL}/transactions/`)
      .then(res => res.json())
      .then(data => setFinanceCatalog(buildFinanceCatalog(data)))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTransactions();
    fetchCatalog();
    setTransactionDate(dateKey);
  }, [dateKey]);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeout = setTimeout(() => {
      setSuccessMessage('');
    }, 1800);

    return () => clearTimeout(timeout);
  }, [successMessage]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const response = await fetch(`${API_URL}/transactions/`, {
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

    if (!response.ok) {
      fetchTransactions();
      return;
    }

    const createdTransaction = await response.json();
    setTransactions(prev => sortTransactions([...prev, createdTransaction]));
    setSuccessMessage('Adicionado com sucesso');

    setDescription('');
    setAmount('');
    setIcon('');
    setShowStickerPicker(false);
    fetchCatalog();
  };

  const handleAddFromCatalog = async (catalogItem) => {
    const payload = {
      description: catalogItem.description,
      amount: parseFloat(catalogItem.amount),
      category: catalogItem.category,
      date: transactionDate,
      icon: catalogItem.icon || null,
      is_completed: false
    };

    const response = await fetch(`${API_URL}/transactions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      fetchTransactions();
      fetchCatalog();
      return;
    }

    const createdTransaction = await response.json();
    setTransactions(prev => sortTransactions([...prev, createdTransaction]));
    setSuccessMessage('Adicionado com sucesso');
  };

  const handleToggle = async (t) => {
    const nextCompleted = !t.is_completed;

    setTransactions(prev => prev.map(item => (
      item.id === t.id ? { ...item, is_completed: nextCompleted } : item
    )));

    const response = await fetch(`${API_URL}/transactions/${t.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: nextCompleted })
    });

    if (!response.ok) {
      setTransactions(prev => prev.map(item => (
        item.id === t.id ? { ...item, is_completed: t.is_completed } : item
      )));
      fetchTransactions();
    }
  };

  const handleDelete = async (id) => {
    const previousTransactions = transactions;
    setTransactions(prev => prev.filter(item => item.id !== id));

    const response = await fetch(`${API_URL}/transactions/${id}/`, { method: 'DELETE' });

    if (!response.ok) {
      setTransactions(previousTransactions);
      fetchTransactions();
      fetchCatalog();
      return;
    }

    fetchCatalog();
  };

  const handleUpdateNotes = async (t) => {
    const newNote = window.prompt("Observação/Nota:", t.notes || "");
    if (newNote !== null) {
      const trimmedNote = newNote.trim();

      setTransactions(prev => prev.map(item => (
        item.id === t.id ? { ...item, notes: trimmedNote } : item
      )));

      const response = await fetch(`${API_URL}/transactions/${t.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: trimmedNote })
      });

      if (!response.ok) {
        setTransactions(prev => prev.map(item => (
          item.id === t.id ? { ...item, notes: t.notes } : item
        )));
        fetchTransactions();
      }
    }
  };

  const handleStartEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditDescription(transaction.description || '');
    setEditAmount(String(transaction.amount || ''));
    setEditIcon(transaction.icon || '');
    setEditCategory(transaction.category || 'DAILY_EXPENSE');
    setEditDate(transaction.date || dateKey);
    setShowEditStickerPicker(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTransaction || !editDescription || !editAmount) return;

    const parsedAmount = parseFloat(editAmount);
    if (Number.isNaN(parsedAmount)) return;

    const payload = {
      description: editDescription,
      amount: parsedAmount,
      category: editCategory,
      date: editDate,
      icon: editIcon || null
    };

    const response = await fetch(`${API_URL}/transactions/${editingTransaction.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      fetchTransactions();
      return;
    }

    const updatedTransaction = await response.json();
    setTransactions(prev => sortTransactions(prev.map(item => (
      item.id === updatedTransaction.id ? updatedTransaction : item
    ))));

    setEditingTransaction(null);
    setShowEditStickerPicker(false);
    fetchCatalog();
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
        {successMessage && <div style={styles.successBanner}>{successMessage}</div>}
        {financeCatalog.length > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
            <button onClick={() => setIsCreatingNew(true)} style={isCreatingNew ? styles.tabActive : styles.tab}>Criar do zero</button>
            <button onClick={() => setIsCreatingNew(false)} style={!isCreatingNew ? styles.tabActive : styles.tab}>Do meu catálogo</button>
          </div>
        )}

        {isCreatingNew || financeCatalog.length === 0 ? (
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowStickerPicker(prev => !prev)}
                style={styles.addStickerBtn}
              >
                <span>{showStickerPicker ? 'Fechar figurinhas' : 'Adicionar figurinha'}</span>
                <span style={styles.stickerPreview}>{icon || '➕'}</span>
              </button>
              {showStickerPicker && (
                <div style={styles.stickerGrid}>
                  <button
                    type="button"
                    onClick={() => setIcon('')}
                    style={{ ...styles.stickerBtn, ...(icon === '' ? styles.stickerBtnActive : {}) }}
                  >
                    ✖️
                  </button>
                  {STICKER_OPTIONS.map((sticker) => {
                    const isSelected = icon === sticker;
                    return (
                      <button
                        key={sticker}
                        type="button"
                        onClick={() => setIcon(sticker)}
                        style={{
                          ...styles.stickerBtn,
                          ...(isSelected ? styles.stickerBtnActive : {})
                        }}
                        aria-label={`Selecionar figurinha ${sticker}`}
                      >
                        {sticker}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Selecione do seu catálogo:</p>
            {financeCatalog.map((item) => (
              <div key={`catalog-${item.id}-${item.description}`} style={styles.catalogItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span style={{ fontSize: '22px' }}>{item.icon || '✨'}</span>
                  <div>
                    <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>{item.description}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                      {item.category === 'EARNING' ? 'Ganho' : item.category === 'FIXED_EXPENSE' ? 'Gasto Fixo' : 'Gasto Diário'} • R$ {parseFloat(item.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFromCatalog(item)}
                  style={styles.catalogUseBtn}
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <FinanceSection 
        title="Histórico de Ganhos" 
        items={earnings} 
        onToggle={handleToggle} 
        onDelete={handleDelete} 
        onUpdateNotes={handleUpdateNotes}
        onEdit={handleStartEdit}
        color="#10b981" 
        showCheck={true}
      />
      
      <FinanceSection 
        title="Gastos Fixos" 
        items={fixedExpenses} 
        onToggle={handleToggle} 
        onDelete={handleDelete} 
        onUpdateNotes={handleUpdateNotes}
        onEdit={handleStartEdit}
        color="#f59e0b" 
        showCheck={true}
      />

      <FinanceSection 
        title="Gastos Diários" 
        items={dailyExpenses} 
        onToggle={handleToggle}
        onDelete={handleDelete} 
        onUpdateNotes={handleUpdateNotes}
        onEdit={handleStartEdit}
        color="#ef4444" 
        showCheck={false}
      />

      {editingTransaction && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Editar Lancamento</h3>
              <button onClick={() => setEditingTransaction(null)} style={styles.closeBtn}>&times;</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditStickerPicker(prev => !prev)}
                  style={styles.addStickerBtn}
                >
                  <span>{showEditStickerPicker ? 'Fechar figurinhas' : 'Trocar figurinha'}</span>
                  <span style={styles.stickerPreview}>{editIcon || '➕'}</span>
                </button>
                {showEditStickerPicker && (
                  <div style={styles.stickerGrid}>
                    <button
                      type="button"
                      onClick={() => setEditIcon('')}
                      style={{ ...styles.stickerBtn, ...(editIcon === '' ? styles.stickerBtnActive : {}) }}
                    >
                      ✖️
                    </button>
                    {STICKER_OPTIONS.map((sticker) => {
                      const isSelected = editIcon === sticker;
                      return (
                        <button
                          key={`edit-${sticker}`}
                          type="button"
                          onClick={() => setEditIcon(sticker)}
                          style={{
                            ...styles.stickerBtn,
                            ...(isSelected ? styles.stickerBtnActive : {})
                          }}
                          aria-label={`Selecionar figurinha ${sticker}`}
                        >
                          {sticker}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Descricao"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={styles.input}
              />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  style={{ ...styles.input, flex: '1 1 120px' }}
                />
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  style={{ ...styles.input, flex: '1 1 140px' }}
                />
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  style={{ ...styles.input, flex: '1 1 140px' }}
                >
                  <option value="EARNING">Ganho</option>
                  <option value="FIXED_EXPENSE">Gasto Fixo</option>
                  <option value="DAILY_EXPENSE">Gasto Diario</option>
                </select>
              </div>

              <button type="submit" className="drink-btn" style={{ width: '100%', borderRadius: '12px', background: '#10b981', border: 'none', color: 'white' }}>
                Salvar Alteracoes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function FinanceSection({ title, items, onToggle, onDelete, onUpdateNotes, onEdit, color, showCheck, defaultIcon }) {
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
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '5px' }}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
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
  tab: {
    flex: 1,
    padding: '8px',
    border: 'none',
    background: 'var(--bg-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontWeight: '700'
  },
  tabActive: {
    flex: 1,
    padding: '8px',
    border: 'none',
    background: '#10b981',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700'
  },
  catalogItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: 'white',
    gap: '10px'
  },
  catalogUseBtn: {
    border: 'none',
    background: '#10b981',
    color: 'white',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  successBanner: {
    marginBottom: '12px',
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid #a7f3d0',
    background: '#ecfdf5',
    color: '#065f46',
    fontSize: '13px',
    fontWeight: '700'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    padding: '20px',
    boxShadow: 'var(--shadow-md)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-muted)'
  },
  addStickerBtn: {
    border: '1px solid #d1fae5',
    borderRadius: '12px',
    background: '#ecfdf5',
    color: '#065f46',
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stickerPreview: {
    fontSize: '18px',
    lineHeight: 1
  },
  stickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
    gap: '8px',
    maxHeight: '132px',
    overflowY: 'auto',
    padding: '2px'
  },
  stickerBtn: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    background: 'white',
    height: '34px',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  stickerBtnActive: {
    border: '2px solid #10b981',
    background: 'rgba(16, 185, 129, 0.12)',
    transform: 'scale(1.03)'
  },
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
