import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function AddRoutineModal({ isOpen, onClose, onAdd, catalog, onDeleteFromCatalog, initialData }) {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [isCreatingNew, setIsCreatingNew] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setTime(initialData?.time || '');
      setIcon(initialData?.icon || '');
      setColor(initialData?.color || '#2563eb');
      if (initialData) setIsCreatingNew(true); // Always show form when editing
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const title = initialData ? 'Editar Rotina' : 'Nova Rotina';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({ name: name.trim(), time: time || null, icon: icon || null, color: color || null });
      setName('');
      setTime('');
      setIcon('');
      setColor('#2563eb');
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{margin:0}}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>
        
        {catalog && catalog.length > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
            <button onClick={() => setIsCreatingNew(true)} style={isCreatingNew ? styles.tabActive : styles.tab}>Criar do zero</button>
            <button onClick={() => setIsCreatingNew(false)} style={!isCreatingNew ? styles.tabActive : styles.tab}>Do meu catálogo</button>
          </div>
        )}

        {isCreatingNew || !catalog || catalog.length === 0 ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="🚀" 
                value={icon}
                onChange={e => setIcon(e.target.value)}
                style={{ ...styles.input, width: '45px', textAlign: 'center', fontSize: '20px' }}
                maxLength={2}
              />
              <input 
                type="text" 
                placeholder="Nome da rotina (ex: Treino)" 
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
                autoFocus
              />
            </div>
            <input 
              type="time" 
              value={time}
              onChange={e => setTime(e.target.value)}
              style={styles.input}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="routine-color" style={{ color: 'var(--text-muted)', fontSize: '14px', minWidth: '40px' }}>Cor</label>
              <input
                id="routine-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={styles.colorInput}
              />
              <span style={styles.colorCode}>{color}</span>
            </div>
            <button type="submit" style={styles.submitBtn}>
              Criar e Adicionar
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Selecione do seu catálogo:</p>
            {catalog.map(cat => (
              <div key={cat.id} style={styles.catalogItem}>
                <div onClick={() => { onAdd(cat); onClose(); }} style={{flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span style={{fontSize: '24px'}}>{cat.icon || '✨'}</span>
                  <div>
                    <strong style={{color: 'var(--text-main)', fontSize: '16px'}}>{cat.name}</strong> 
                    <span style={{fontSize:'12px', color:'var(--primary-color)', fontWeight:'bold', display: 'block'}}>{cat.time}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteFromCatalog(cat.id); }} 
                  style={styles.deleteCatalogBtn}
                  title="Excluir do catálogo"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 'var(--border-radius)',
    padding: '20px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow-md)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-muted)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    outline: 'none'
  },
  colorInput: {
    width: '44px',
    height: '34px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '2px'
  },
  colorCode: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    letterSpacing: '0.02em'
  },
  submitBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px'
  },
  tab: {
    flex: 1, padding: '8px', border: 'none', background: 'var(--bg-color)', borderRadius:'8px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 'bold'
  },
  tabActive: {
    flex: 1, padding: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', borderRadius:'8px', cursor: 'pointer', fontWeight: 'bold'
  },
  catalogItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  deleteCatalogBtn: {
    background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
  }
};
