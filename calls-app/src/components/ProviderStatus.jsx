export default function ProviderStatus({ providers, connectingId, errors, onConnect, onDisconnect }) {
  return (
    <div className="provider-status">
      {providers.map((p) => (
        <div key={p.id} className="provider-row">
          <span className={`connection-dot${p.connected ? ' connected' : ''}`} />
          <span className="provider-label">{p.label}</span>
          <span className="provider-state">
            {!p.configured
              ? 'Falta configurar Client ID'
              : connectingId === p.id
              ? 'Conectando…'
              : p.connected
              ? 'Conectado'
              : 'No conectado'}
          </span>
          {p.configured && (
            <button
              className="connect-button"
              disabled={connectingId === p.id}
              onClick={() => (p.connected ? onDisconnect(p.id) : onConnect(p.id))}
            >
              {p.connected ? 'Desconectar' : 'Conectar'}
            </button>
          )}
          {!p.configured && (
            <button className="connect-button" disabled title="Agrega el Client ID en .env — ver README.md">
              Conectar
            </button>
          )}
        </div>
      ))}
      {errors?.length > 0 && (
        <div className="provider-error">
          No se pudieron cargar algunos eventos: {errors.map((e) => e.message).join(' · ')}
        </div>
      )}
    </div>
  );
}
