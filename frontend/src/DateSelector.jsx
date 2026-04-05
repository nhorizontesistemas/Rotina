import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DateSelector({ date, onPrev, onNext }) {
  const formatDate = (dateObj) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'long'
    }).format(dateObj);
  };

  return (
    <div className="date-selector">
      <button className="date-btn" onClick={onPrev}>
        <ChevronLeft size={24} />
      </button>
      <div className="date-display">
        {formatDate(date)}
      </div>
      <button className="date-btn" onClick={onNext}>
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
