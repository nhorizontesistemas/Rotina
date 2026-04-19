import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calculator, ArrowRight, Wallet, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function CalculatorScreen({ API_URL }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [expandedBudgets, setExpandedBudgets] = useState(new Set());

  // Form states
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  
  const [debtDesc, setDebtDesc] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [addingDebtTo, setAddingDebtTo] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${API_URL}/budget-calculators/`);
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : data.results || []);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const toggleExpand = (id) => {
    const next = new Set(expandedBudgets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedBudgets(next);
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!budgetName || !budgetAmount) return;

    try {
      const res = await fetch(`${API_URL}/budget-calculators/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: budgetName, total_amount: parseFloat(budgetAmount) })
      });
      if (res.ok) {
        fetchBudgets();
        setBudgetName('');
        setBudgetAmount('');
        setShowAddBudget(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!editingBudget || !budgetName || !budgetAmount) return;

    try {
      const res = await fetch(`${API_URL}/budget-calculators/${editingBudget.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: budgetName, total_amount: parseFloat(budgetAmount) })
      });
      if (res.ok) {
        fetchBudgets();
        setEditingBudget(null);
        setBudgetName('');
        setBudgetAmount('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Excluir este orçamento definitivamente?")) return;
    try {
      const res = await fetch(`${API_URL}/budget-calculators/${id}/`, { method: 'DELETE' });
      if (res.ok) fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!debtDesc || !debtAmount || !addingDebtTo) return;

    try {
      const res = await fetch(`${API_URL}/budget-debts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          budget: addingDebtTo, 
          description: debtDesc, 
          amount: parseFloat(debtAmount) 
        })
      });
      if (res.ok) {
        fetchBudgets();
        setDebtDesc('');
        setDebtAmount('');
        setAddingDebtTo(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDebt = async (e) => {
    e.preventDefault();
    if (!editingDebt || !debtDesc || !debtAmount) return;

    try {
      const res = await fetch(`${API_URL}/budget-debts/${editingDebt.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: debtDesc, 
          amount: parseFloat(debtAmount) 
        })
      });
      if (res.ok) {
        fetchBudgets();
        setEditingDebt(null);
        setDebtDesc('');
        setDebtAmount('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDebt = async (id) => {
    if (!window.confirm("Excluir esta dívida?")) return;
    try {
      const res = await fetch(`${API_URL}/budget-debts/${id}/`, { method: 'DELETE' });
      if (res.ok) fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>;

  return (
    <div className="calculator-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px', padding: '10px', borderRadius: '24px', background: 'linear-gradient(180deg, #f5f3ff 0%, #f8fafc 100%)', minHeight: '80vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Calculator size={28} /> Calculadora
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Gerencie orçamentos e dívidas</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => {
            setShowAddBudget(true);
            setEditingBudget(null);
            setBudgetName('');
            setBudgetAmount('');
          }}
          style={{ flex: 2, background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white', border: 'none', padding: '14px', borderRadius: '16px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)' }}
        >
          <Plus size={20} /> Novo Orçamento
        </button>
        {expandedBudgets.size > 0 && (
          <button 
            onClick={() => setExpandedBudgets(new Set())}
            style={{ flex: 1, background: 'white', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '14px', borderRadius: '16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            Recolher
          </button>
        )}
      </div>

      {/* MODAL / FORM FOR BUDGET */}
      {(showAddBudget || editingBudget) && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</h3>
            <form onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Nome (Ex: Viagem, Reforma)" 
                value={budgetName} 
                onChange={e => setBudgetName(e.target.value)} 
                style={styles.input}
                autoFocus
              />
              <input 
                type="number" 
                placeholder="Valor do Orçamento" 
                value={budgetAmount} 
                onChange={e => setBudgetAmount(e.target.value)} 
                style={styles.input}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => { setShowAddBudget(false); setEditingBudget(null); }} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.confirmBtn}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / FORM FOR DEBT */}
      {(addingDebtTo || editingDebt) && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>{editingDebt ? 'Editar Dívida' : 'Adicionar Dívida'}</h3>
            <form onSubmit={editingDebt ? handleUpdateDebt : handleAddDebt} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Descrição (Ex: Passagem, Tintas)" 
                value={debtDesc} 
                onChange={e => setDebtDesc(e.target.value)} 
                style={styles.input}
                autoFocus
              />
              <input 
                type="number" 
                placeholder="Valor" 
                value={debtAmount} 
                onChange={e => setDebtAmount(e.target.value)} 
                style={styles.input}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => { setAddingDebtTo(null); setEditingDebt(null); setDebtDesc(''); setDebtAmount(''); }} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.confirmBtn}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {budgets.map(budget => {
          const totalDebts = budget.debts?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0;
          const balance = parseFloat(budget.total_amount) - totalDebts;
          const isExpanded = expandedBudgets.has(budget.id);

          return (
            <div key={budget.id} className="card" style={{ padding: '0', overflow: 'hidden', borderLeft: '6px solid #8b5cf6', background: 'var(--card-bg)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div onClick={() => toggleExpand(budget.id)} style={{ padding: '20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#f5f3ff', color: '#7c3aed', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{budget.name}</h4>
                      {!isExpanded && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: balance >= 0 ? '#059669' : '#dc2626', fontWeight: '600' }}>
                          Saldo: R$ {balance.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingBudget(budget); setBudgetName(budget.name); setBudgetAmount(budget.total_amount); }} style={styles.iconBtn}><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBudget(budget.id); }} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={16} /></button>
                    {isExpanded ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 20px 20px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '12px', border: '1px solid #e9e5ff' }}>
                      <p style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700', margin: '0 0 4px 0' }}>ORÇAMENTO</p>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#4b5563' }}>R$ {parseFloat(budget.total_amount).toFixed(2)}</span>
                    </div>
                    <div style={{ background: balance >= 0 ? '#ecfdf5' : '#fef2f2', padding: '12px', borderRadius: '12px', border: balance >= 0 ? '1px solid #d1fae5' : '1px solid #fee2e2' }}>
                      <p style={{ fontSize: '11px', color: balance >= 0 ? '#059669' : '#dc2626', fontWeight: '700', margin: '0 0 4px 0' }}>RESTANDO</p>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: balance >= 0 ? '#065f46' : '#991b1b' }}>R$ {balance.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>Dívidas / Gastos</h5>
                    <button 
                      onClick={() => { setAddingDebtTo(budget.id); setDebtDesc(''); setDebtAmount(''); }}
                      style={{ background: '#ddd6fe', color: '#6d28d9', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {budget.debts?.map(debt => (
                      <div key={debt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>{debt.description}</p>
                          <span style={{ fontSize: '13px', color: '#6d28d9', fontWeight: '700' }}>R$ {parseFloat(debt.amount).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => { setEditingDebt(debt); setDebtDesc(debt.description); setDebtAmount(debt.amount); }} style={styles.miniBtn}><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteDebt(debt.id)} style={{ ...styles.miniBtn, color: '#ef4444' }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                    {(!budget.debts || budget.debts.length === 0) && (
                      <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '10px 0' }}>Nenhuma dívida cadastrada.</p>
                    )}
                    <button 
                      onClick={() => toggleExpand(budget.id)}
                      style={{ marginTop: '10px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'center' }}
                    >
                      Minimizar Orçamento
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', background: '#f5f3ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#8b5cf6' }}>
              <Wallet size={32} />
            </div>
            <p style={{ color: '#4b5563', fontWeight: '600' }}>Nenhum orçamento ainda</p>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>Clique no botão acima para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
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
    backgroundColor: 'white',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '400px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#f9fafb'
  },
  confirmBtn: {
    flex: 2,
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  cancelBtn: {
    flex: 1,
    background: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    padding: '12px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  iconBtn: {
    background: '#f3f4f6',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    cursor: 'pointer'
  },
  miniBtn: {
    background: 'none',
    border: 'none',
    padding: '4px',
    color: '#9ca3af',
    cursor: 'pointer'
  }
};
