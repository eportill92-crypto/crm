import CallCard from './CallCard';

export default function CallList({ events, now }) {
  const past = events.filter((e) => e.end <= now);
  const upcoming = events.filter((e) => e.end > now);

  if (events.length === 0) {
    return <div className="empty-state">No tienes llamadas programadas este día.</div>;
  }

  return (
    <div className="call-list">
      {past.length > 0 && (
        <section>
          <h2 className="section-label">Pasadas</h2>
          {past.map((e) => (
            <CallCard key={e.id} event={e} isPast />
          ))}
        </section>
      )}
      {upcoming.length > 0 && (
        <section>
          <h2 className="section-label">Programadas</h2>
          {upcoming.map((e) => (
            <CallCard key={e.id} event={e} isPast={false} />
          ))}
        </section>
      )}
    </div>
  );
}
