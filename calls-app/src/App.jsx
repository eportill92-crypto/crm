import { useCallback, useEffect, useMemo, useState } from 'react';
import DateStrip from './components/DateStrip';
import CallList from './components/CallList';
import ProviderStatus from './components/ProviderStatus';
import { getEventsForDay } from './lib/calendarService';
import { getGoogleIcalStatus } from './lib/googleIcal';
import { connectMicrosoft, disconnectMicrosoft, getMicrosoftToken, isMicrosoftConfigured } from './lib/microsoftAuth';

const DATE_LABEL_OPTS = { weekday: 'long', day: 'numeric', month: 'long' };

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState([]);
  const [connections, setConnections] = useState({ google: false, microsoft: false });
  const [connectingId, setConnectingId] = useState(null);

  // Google no requiere login: el servidor ya tiene el enlace secreto de
  // Google Calendar (ver calls-app/api/calendar.js), solo preguntamos si
  // está configurado. Microsoft sí es login normal (MSAL).
  useEffect(() => {
    getGoogleIcalStatus().then((configured) => {
      setConnections((c) => ({ ...c, google: configured }));
    });
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
    if (id !== 'microsoft') return; // Google se detecta solo, no tiene botón de login
    setConnectingId(id);
    try {
      await connectMicrosoft();
      setConnections((c) => ({ ...c, microsoft: true }));
    } catch (err) {
      setErrors((prev) => [...prev, err]);
    } finally {
      setConnectingId(null);
    }
  }, []);

  const handleDisconnect = useCallback(async (id) => {
    if (id !== 'microsoft') return;
    await disconnectMicrosoft();
    setConnections((c) => ({ ...c, microsoft: false }));
  }, []);

  const providers = useMemo(
    () => [
      { id: 'google', label: 'Google Calendar', configured: true, connected: connections.google, autoManaged: true },
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
          <div className="mock-banner">
            Mostrando datos de ejemplo — configura el enlace secreto de Google Calendar en Vercel (ver README) para ver tus llamadas reales.
          </div>
        )}
        <CallList events={events} now={new Date()} />
      </main>
    </div>
  );
}
