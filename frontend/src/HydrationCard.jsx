import React from 'react';
import { Droplet, Edit2, RotateCcw } from 'lucide-react';

export default function HydrationCard({ consumed, goal, onDrink, onEditGoal, onReset }) {
  const percentage = Math.min((consumed / goal) * 100, 100);

  return (
    <div className="card hydration-card">
      <div className="water-progress-bg" style={{ height: `${percentage}%` }}></div>
      <div className="water-content">
        <div className="water-stats" style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '5px' }}>💧</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800' }}>{consumed} ml</h2>
          <p 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.8 }} 
            onClick={onEditGoal}
            title="Editar meta"
          >
            Meta: {goal} ml <Edit2 size={12} />
          </p>
          {consumed > 0 && (
            <button 
              onClick={onReset} 
              style={{ position: 'absolute', right: 0, top: 0, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              title="Zerar água"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
        <div className="drink-actions">
          <button className="drink-btn" onClick={() => onDrink(400)}>
            <Droplet size={18} />
            +400ml
          </button>
          <button className="drink-btn" onClick={() => onDrink(600)}>
            <Droplet size={18} />
            +600ml
          </button>
        </div>
      </div>
    </div>
  );
}
