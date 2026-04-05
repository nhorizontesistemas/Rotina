import React from 'react';
import { Check, Trash2, Edit2, MessageSquare } from 'lucide-react';

export default function RoutineChecklist({ routines, onToggle, onDelete, onEdit, onUpdateNotes }) {
  return (
    <div className="routine-list">
      {routines.map((routine) => (
        <div key={routine.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div className={`routine-item ${routine.completed ? 'completed' : ''}`}>
            <div className="routine-info" onClick={() => onToggle(routine.id)} style={{ flex: 1, cursor: 'pointer' }}>
              <h4>
                <span style={{ marginRight: '8px' }}>{routine.icon || '✨'}</span>
                {routine.name}
              </h4>
              {routine.time && <span>{routine.time}</span>}
            </div>
            
            <div className="routine-actions">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateNotes(routine.id); }}
                style={{ background: 'none', border: 'none', color: routine.notes ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}
                title="Adicionar Observação"
              >
                <MessageSquare size={18} fill={routine.notes ? 'rgba(78, 115, 248, 0.1)' : 'none'} />
              </button>
              <Edit2 size={18} className="action-icon" onClick={(e) => { e.stopPropagation(); onEdit(routine.id); }} />
              <Trash2 size={18} className="action-icon" onClick={(e) => { e.stopPropagation(); onDelete(routine.id); }} />
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
              borderLeft: '3px solid var(--primary-color)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}>
              "{routine.notes}"
            </div>
          )}
        </div>
      ))}
      {routines.length === 0 && (
        <p style={{textAlign:'center', color:'var(--text-muted)', paddingTop: '10px'}}>Nenhuma rotina para hoje.</p>
      )}
    </div>
  );
}
