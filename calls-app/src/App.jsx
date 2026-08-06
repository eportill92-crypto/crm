import { useCallback, useEffect, useMemo, useState } from 'react';
import DateStrip from './components/DateStrip';
import CallList from './components/CallList';
import ProviderStatus from './components/ProviderStatus';
import { getEventsForDay } from './lib/calendarService';
import { connectGoogle, disconnectGoogle, getGoogleToken, isGoogleConfigured } from './lib/googleAuth';
import { connectMicrosoft, disconnectMicrosoft, getMicrosoftToken, isMicrosoftConfigured } from './lib/microsoftAuth';

const DATE_LABEL_OPTS = { weekday: 'long', day: 'numeric', month: 'long' };

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState([]);
  const [connections, setConnections] = useState({ google: false, microsoft: false });
  const [connectingId, setConnectingId] = useState(null);

  // Al cargar, revisa si ya había una sesión activa (token en sessionStorage / MSAL cache).
  useEffect(() => {
    setConnections((c) => ({ ...c, google: Boolean(getGoogleToken()) }));
    getMicrosoftToken().then((token) => {
      setConnections((c) => ({ ...c, microsoft: Boolean(token) }));
    });
  }, []);

  useEffect(() => {
    let active = true;
    getEventsForDay(selectedDate, connections).then((result) => {
      if (!active) return;
      setEvents(result.events);
      setErrors(result.errors);
    });
    return () => {
      active = false;
    };
  }, [selectedDate, connections]);

  const handleConnect = useCallback(async (id) => {
    setConnectingId(id);
    try {
      if (id === 'google') await connectGoogle();
      if (id === 'microsoft') await connectMicrosoft();
      setConnections((c) => ({ ...c, [id]: true }));
    } catch (err) {
      setErrors((prev) => [...prev, err]);
    } finally {
      setConnectingId(null);
    }
  }, []);

  const handleDisconnect = useCallback(async (id) => {
    if (id === 'google') disconnectGoogle();
    if (id === 'microsoft') await disconnectMicrosoft();
    setConnections((c) => ({ ...c, [id]: false }));
  }, []);

  const providers = useMemo(
    () => [
      { id: 'google', label: 'Google Calendar', configured: isGoogleConfigured(), connected: connections.google },
      { id: 'microsoft', label: 'Microsoft 365 / Teams', configured: isMicrosoftConfigured(), connected: connections.microsoft },
    ],
    [connections]
  );

  const handleSelectDate = (d) => {
    setSelectedDate(d);
    setWeekOffset(0);
  };

  const rawDateLabel = selectedDate.toLocaleDateString('es-MX', DATE_LABEL_OPTS);
  const dateLabel = rawDateLabel.charAt(0).toUpperCase() + rawDateLabel.slice(1);
  const usingMockData = !connections.google && !connections.microsoft;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Unified Calls</h1>
        <p className="app-subtitle">Todas tus llamadas — Meet, Teams, Zoom — en un solo lugar</p>
      </header>

      <ProviderStatus
        providers={providers}
        connectingId={connectingId}
        errors={errors}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="app-main">
        <div className="day-heading">{dateLabel}</div>
        <DateStrip
          selectedDate={selectedDate}
          weekOffset={weekOffset}
          onSelect={handleSelectDate}
          onShiftWeek={(dir) => setWeekOffset((o) => o + dir)}
        />
        {usingMockData && (
          <div className="mock-banner">Mostrando datos de ejemplo — conecta Google o Microsoft arriba para ver tus llamadas reales.</div>
        )}
        <CallList events={events} now={new Date()} />
      </main>
    </div>
  );
}
