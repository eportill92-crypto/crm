const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

export default function DateStrip({ selectedDate, onSelect, weekOffset, onShiftWeek }) {
  const weekStart = startOfWeek(selectedDate);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date();

  return (
    <div className="date-strip">
      <button className="week-nav" onClick={() => onShiftWeek(-1)} aria-label="Semana anterior">
        ‹
      </button>
      {days.map((d) => {
        const selected = isSameDay(d, selectedDate);
        const isToday = isSameDay(d, today);
        return (
          <button
            key={d.toISOString()}
            className={`date-cell${selected ? ' selected' : ''}`}
            onClick={() => onSelect(d)}
          >
            <span className="date-weekday">{WEEKDAY_LABELS[d.getDay()]}</span>
            <span className={`date-number${isToday && !selected ? ' is-today' : ''}`}>{d.getDate()}</span>
          </button>
        );
      })}
      <button className="week-nav" onClick={() => onShiftWeek(1)} aria-label="Semana siguiente">
        ›
      </button>
    </div>
  );
}
