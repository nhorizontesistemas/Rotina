import React from 'react';

export default function ProgressCard({ total, completed }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="card progress-card">
      <div className="progress-header">
        <h4>Progresso Geral</h4>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        {completed} de {total} rotinas concluídas
      </p>
    </div>
  );
}
