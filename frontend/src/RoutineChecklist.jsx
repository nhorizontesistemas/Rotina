import React from 'react';
import { Check, Trash2, Edit2, MessageSquare } from 'lucide-react';

function hexToRgba(hex, alpha = 1) {
  const cleanHex = hex?.replace('#', '');
  if (!cleanHex || ![3, 6].includes(cleanHex.length)) return hex;

  const normalizedHex = cleanHex.length === 3
    ? cleanHex.split('').map((char) => char + char).join('')
    : cleanHex;

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getTextColor(backgroundHex) {
  const cleanHex = backgroundHex?.replace('#', '');
  if (!cleanHex || ![3, 6].includes(cleanHex.length)) return '#ffffff';

  const normalizedHex = cleanHex.length === 3
    ? cleanHex.split('').map((char) => char + char).join('')
    : cleanHex;

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? '#0f172a' : '#ffffff';
}

export default function RoutineChecklist({ routines, onToggle, onDelete, onEdit, onUpdateNotes }) {
  return (
    <div className="routine-list">
      {routines.map((routine) => {
        const taskColor = routine.color || '#2563eb';
        const textColor = getTextColor(taskColor);
        const secondaryTextColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.72)';
        const actionColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.92)' : '#0f172a';
        const cardBackground = routine.completed ? hexToRgba(taskColor, 0.45) : taskColor;

        return (
          <div key={routine.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div
              className={`routine-item ${routine.completed ? 'completed' : ''}`}
              style={{ backgroundColor: cardBackground, border: 'none' }}
            >
              <div className="routine-info" onClick={() => onToggle(routine.id)} style={{ flex: 1, cursor: 'pointer' }}>
                <h4 style={{ color: textColor }}>
                  <span style={{ marginRight: '8px' }}>{routine.icon || '✨'}</span>
                  {routine.name}
                </h4>
                {routine.time && <span style={{ color: secondaryTextColor }}>{routine.time}</span>}
              </div>

              <div className="routine-actions">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateNotes(routine.id); }}
                  style={{ background: 'none', border: 'none', color: actionColor, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}
                  title="Adicionar Observacao"
                >
                  <MessageSquare size={18} fill={routine.notes ? 'rgba(255, 255, 255, 0.3)' : 'none'} />
                </button>
                <Edit2 size={18} className="action-icon" style={{ color: actionColor }} onClick={(e) => { e.stopPropagation(); onEdit(routine.id); }} />
                <Trash2 size={18} className="action-icon" style={{ color: actionColor }} onClick={(e) => { e.stopPropagation(); onDelete(routine.id); }} />
                <div
                  className={`checkbox-circle ${routine.completed ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onToggle(routine.id); }}
                >
                  {routine.completed && <Check size={16} strokeWidth={4} />}
                </div>
              </div>
            </div>

            {routine.notes && (
              <div style={{
                marginLeft: '15px',
                marginRight: '15px',
                marginBottom: '10px',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                borderLeft: `3px solid ${taskColor}`,
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}>
                "{routine.notes}"
              </div>
            )}
          </div>
        );
      })}
      {routines.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '10px' }}>Nenhuma rotina para hoje.</p>
      )}
    </div>
  );
}
