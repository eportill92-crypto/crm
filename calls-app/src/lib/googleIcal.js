// Cliente del endpoint /api/calendar (ver calls-app/api/calendar.js).
// No hay login: el servidor ya tiene el enlace secreto de Google Calendar
// guardado como variable de entorno, así que esto solo pregunta si está
// configurado y pide los eventos del rango pedido.

export async function getGoogleIcalStatus() {
  try {
    const res = await fetch('/api/calendar?probe=1');
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.configured);
  } catch {
    return false;
  }
}

export async function fetchGoogleIcalEvents({ from, to }) {
  const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
  const res = await fetch(`/api/calendar?${params}`);
  if (!res.ok) throw new Error('No se pudo leer tu Google Calendar.');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return (data.events || []).map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
}
