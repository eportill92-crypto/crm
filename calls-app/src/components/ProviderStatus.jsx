export default function ProviderStatus({ providers }) {
  return (
    <div className="provider-status">
      {providers.map((p) => (
        <div key={p.id} className="provider-row">
          <span className={`connection-dot${p.connected ? ' connected' : ''}`} />
          <span className="provider-label">{p.label}</span>
          <span className="provider-state">{p.connected ? 'Conectado' : 'No conectado'}</span>
          {!p.connected && (
            <button className="connect-button" disabled title="Requiere credenciales OAuth — ver README.md">
              Conectar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
