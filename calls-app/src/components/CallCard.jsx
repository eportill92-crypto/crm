import PlatformBadge from './PlatformBadge';

function formatTime(date) {
  return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
}

export default function CallCard({ event, isPast }) {
  return (
    <div className={`call-card${isPast ? ' past' : ''}`}>
      <div className="call-card-info">
        <div className="call-card-time">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>
        <div className="call-card-title">{event.title}</div>
        <div className="call-card-meta">
          <PlatformBadge platform={event.platform} />
          <span className="call-card-source">{event.source}</span>
        </div>
      </div>
      {!isPast && event.joinUrl && (
        <a className="join-button" href={event.joinUrl} target="_blank" rel="noreferrer">
          Unirse
        </a>
      )}
    </div>
  );
}
