import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle, Circle, RotateCcw } from 'lucide-react';

const COLOR_OPTIONS = [
  { key: 'green',  label: 'Verde',    bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16,185,129,0.4)',  border: '#6ee7b7', solid: '#10b981' },
  { key: 'yellow', label: 'Amarelo',  bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245,158,11,0.4)',  border: '#fcd34d', solid: '#f59e0b' },
  { key: 'red',    label: 'Vermelho', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', shadow: 'rgba(239,68,68,0.4)',   border: '#fca5a5', solid: '#ef4444' },
];

function getColor(key) {
  return COLOR_OPTIONS.find(c => c.key === key) || COLOR_OPTIONS[0];
}

export default function DesafioScreen({ API_URL }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState('green');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/desafio/`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openItem = (item) => {
    setSelected(item);
    setNoteText(item.notes || '');
    setSelectedColor(item.color || 'green');
  };

  const closeModal = () => {
    setSelected(null);
    setNoteText('');
    setSelectedColor('green');
  };

  const patch = async (id, payload) => {
    const res = await fetch(`${API_URL}/desafio/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setSaving(true);
    const ok = await patch(selected.id, { notes: noteText, color: selectedColor });
    if (ok) {
      setItems(prev => prev.map(it => it.id === selected.id ? { ...it, notes: noteText, color: selectedColor } : it));
      setSelected(prev => ({ ...prev, notes: noteText, color: selectedColor }));
    }
    setSaving(false);
  };

  const handleToggleMark = async () => {
    if (!selected) return;
    const newMarked = !selected.is_marked;
    const ok = await patch(selected.id, { is_marked: newMarked, color: selectedColor });
    if (ok) {
      setItems(prev => prev.map(it => it.id === selected.id ? { ...it, is_marked: newMarked, color: selectedColor } : it));
      setSelected(prev => ({ ...prev, is_marked: newMarked, color: selectedColor }));
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Zerar tudo? Notas, cores e checks serão apagados.')) return;
    const res = await fetch(`${API_URL}/desafio/reset_all/`, { method: 'POST' });
    if (res.ok) {
      setItems(prev => prev.map(it => ({ ...it, notes: '', is_marked: false, color: 'green' })));
    }
  };

  const markedCount = items.filter(i => i.is_marked).length;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Carregando...</div>;

  return (
    <div style={{ padding: '16px', paddingBottom: '100px', minHeight: '100vh', background: 'linear-gradient(180deg, #ecfdf5 0%, #f8fafc 100%)' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#065f46', margin: '0 0 4px 0' }}>
          🎯 Desafio 30 Dias
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
          {markedCount} / 30 concluídos
        </p>
        <div style={{ marginTop: '10px', height: '8px', background: '#d1fae5', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(markedCount / 30) * 100}%`, background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {items.map(item => {
          const marked = item.is_marked;
          const hasNote = item.notes && item.notes.trim().length > 0;
          const c = getColor(item.color);
          return (
            <button
              key={item.id}
              onClick={() => openItem(item)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '50%',
                border: marked ? 'none' : `2px solid ${c.border}`,
                background: marked ? c.bg : 'white',
                color: marked ? 'white' : '#065f46',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: marked ? `0 4px 12px ${c.shadow}` : '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {item.number}
              {hasNote && !marked && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#f59e0b',
                }} />
              )}
            </button>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '16px' }}>
        Ponto amarelo = tem anotação · Colorido = marcado
      </p>

      <button
        onClick={handleResetAll}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          margin: '16px auto 0 auto', padding: '12px 24px', borderRadius: '14px',
          border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626',
          fontWeight: '700', fontSize: '14px', cursor: 'pointer',
        }}
      >
        <RotateCcw size={16} /> Zerar Tudo
      </button>

      {/* Modal */}
      {selected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '24px',
            width: '100%', maxWidth: '480px', padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#065f46' }}>
                Dia {selected.number}
              </h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
                <X size={16} />
              </button>
            </div>

            {/* Color picker */}
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', margin: '0 0 8px 0' }}>COR DA BOLINHA</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedColor(c.key)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: c.bg, border: selectedColor === c.key ? `3px solid #1f2937` : '3px solid transparent',
                      cursor: 'pointer', boxShadow: `0 3px 8px ${c.shadow}`,
                      outline: 'none', transition: 'transform 0.1s',
                      transform: selectedColor === c.key ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Anote algo sobre este dia..."
              rows={5}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                border: '1px solid #d1fae5', fontSize: '14px',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                background: '#f0fdf4', color: '#1f2937', lineHeight: '1.5',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={handleToggleMark}
                style={{
                  flex: 1, padding: '13px', borderRadius: '14px', border: 'none',
                  background: selected.is_marked ? '#fef2f2' : '#ecfdf5',
                  color: selected.is_marked ? '#dc2626' : '#059669',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {selected.is_marked ? <><Circle size={16} /> Desmarcar</> : <><CheckCircle size={16} /> Marcar</>}
              </button>
              <button
                onClick={handleSaveNote}
                disabled={saving}
                style={{
                  flex: 1, padding: '13px', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Nota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
