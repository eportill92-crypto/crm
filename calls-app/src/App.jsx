import { useEffect, useMemo, useState } from 'react';
import DateStrip from './components/DateStrip';
import CallList from './components/CallList';
import ProviderStatus from './components/ProviderStatus';
import { getEventsForDay, getConnectionStatus } from './lib/calendarService';

const DATE_LABEL_OPTS = { weekday: 'long', day: 'numeric', month: 'long' };

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState([]);
  const providers = useMemo(() => getConnectionStatus(), []);

  useEffect(() => {
    let active = true;
    getEventsForDay(selectedDate).then((data) => {
      if (active) setEvents(data);
    });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const handleSelectDate = (d) => {
    setSelectedDate(d);
    setWeekOffset(0);
  };

  const rawDateLabel = selectedDate.toLocaleDateString('es-MX', DATE_LABEL_OPTS);
  const dateLabel = rawDateLabel.charAt(0).toUpperCase() + rawDateLabel.slice(1);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Unified Calls</h1>
        <p className="app-subtitle">Todas tus llamadas — Meet, Teams, Zoom — en un solo lugar</p>
      </header>

      <ProviderStatus providers={providers} />

      <main className="app-main">
        <div className="day-heading">{dateLabel}</div>
        <DateStrip
          selectedDate={selectedDate}
          weekOffset={weekOffset}
          onSelect={handleSelectDate}
          onShiftWeek={(dir) => setWeekOffset((o) => o + dir)}
        />
        <CallList events={events} now={new Date()} />
      </main>
    </div>
  );
}
