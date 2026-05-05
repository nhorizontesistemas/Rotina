import React, { useState } from 'react';
import { Check, Trash2, Edit2, MessageSquare, GripVertical } from 'lucide-react';

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

export default function RoutineChecklist({ routines, onToggle, onDelete, onEdit, onUpdateNotes, onReorder }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newRoutines = [...routines];
    const [draggedRoutine] = newRoutines.splice(draggedIndex, 1);
    newRoutines.splice(dropIndex, 0, draggedRoutine);

    if (onReorder) {
      onReorder(newRoutines);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  return (
    <div className="routine-list">
      {routines.map((routine, index) => {
        const taskColor = routine.color || '#2563eb';
        const textColor = '#1f2937';
        const secondaryTextColor = '#64748b';
        const actionColor = hexToRgba(taskColor, 0.86);
        const cardBackground = hexToRgba(taskColor, routine.completed ? 0.2 : 0.12);
        const cardBorder = `2px dashed ${hexToRgba(taskColor, routine.completed ? 0.48 : 0.65)}`;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div key={routine.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div
              className={`routine-item ${routine.completed ? 'completed' : ''}`}
              style={{
                backgroundColor: cardBackground,
                border: cardBorder,
                opacity: isDragging ? 0.5 : (routine.completed ? 0.88 : 1),
                borderTop: isDragOver ? `3px solid ${hexToRgba(taskColor, 0.85)}` : cardBorder,
                transition: 'opacity 0.2s, border-top 0.2s, background-color 0.2s',
                cursor: 'grab'
              }}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GripVertical size={16} style={{ color: actionColor, opacity: 0.6, flexShrink: 0 }} />
                <div className="routine-info" onClick={() => onToggle(routine.id)} style={{ flex: 1, cursor: 'pointer' }}>
                  <h4 style={{ color: textColor }}>
                    <span style={{ marginRight: '8px' }}>{routine.icon || '✨'}</span>
                    {routine.name}
                  </h4>
                  {routine.time && <span style={{ color: secondaryTextColor }}>{routine.time}</span>}
                </div>
              </div>

              <div className="routine-actions">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateNotes(routine.id); }}
                  style={{ background: 'none', border: 'none', color: actionColor, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}
                  title="Adicionar Observacao"
                >
                  <MessageSquare size={18} fill={routine.notes ? hexToRgba(taskColor, 0.2) : 'none'} />
                </button>
                <Edit2 size={18} className="action-icon" style={{ color: actionColor }} onClick={(e) => { e.stopPropagation(); onEdit(routine.id); }} />
                <Trash2 size={18} className="action-icon" style={{ color: actionColor }} onClick={(e) => { e.stopPropagation(); onDelete(routine.id); }} />
                <div
                  className={`checkbox-square ${routine.completed ? 'active' : ''}`}
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
                background: hexToRgba(taskColor, 0.09),
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                border: `1px dashed ${hexToRgba(taskColor, 0.4)}`,
                borderLeft: `3px solid ${hexToRgba(taskColor, 0.7)}`,
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
