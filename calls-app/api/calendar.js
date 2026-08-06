// Función serverless (Vercel). Lee el enlace privado en formato iCal de
// Google Calendar (guardado como variable de entorno GOOGLE_ICAL_URL, nunca
// en el código) y lo devuelve como eventos ya listos para la UI.
//
// El link se obtiene desde Google Calendar > Ajustes > (tu calendario) >
// "Integrar calendario" > "Dirección secreta en formato iCal" — no requiere
// Google Cloud Console ni OAuth.

import ical from 'node-ical';

function detectPlatform(text = '') {
  const value = text.toLowerCase();
  if (value.includes('meet.google.com')) return 'meet';
  if (value.includes('teams.microsoft.com') || value.includes('teams.live.com')) return 'teams';
  if (value.includes('zoom.us')) return 'zoom';
  return text ? 'other' : 'phone';
}

function extractUrl(text = '') {
  const match = text.match(/https?:\/\/[^\s"<>]+/i);
  return match ? match[0].replace(/&amp;/g, '&') : '';
}

function expandOccurrences(event, from, to) {
  if (!event.rrule) return [event];
  const duration = event.end.getTime() - event.start.getTime();
  const dates = event.rrule.between(from, to, true);
  return dates.map((date) => ({ ...event, start: date, end: new Date(date.getTime() + duration) }));
}

export default async function handler(req, res) {
  const icalUrl = process.env.GOOGLE_ICAL_URL;

  if (req.query.probe) {
    res.status(200).json({ configured: Boolean(icalUrl) });
    return;
  }

  if (!icalUrl) {
    res.status(200).json({ configured: false, events: [] });
    return;
  }

  const from = req.query.from ? new Date(req.query.from) : new Date();
  const to = req.query.to ? new Date(req.query.to) : new Date(from.getTime() + 24 * 60 * 60 * 1000);

  try {
    const data = await ical.async.fromURL(icalUrl);

    const events = Object.values(data)
      .filter((e) => e.type === 'VEVENT' && e.start && e.end)
      .flatMap((e) => expandOccurrences(e, from, to))
      .filter((e) => e.end > from && e.start < to)
      .map((e) => {
        const text = [e.location, e.description].filter(Boolean).join(' ');
        const joinUrl = extractUrl(text);
        return {
          id: `google-${e.uid}-${e.start.toISOString()}`,
          title: e.summary || '(Sin título)',
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          joinUrl,
          platform: detectPlatform(joinUrl),
          source: 'Google Calendar',
        };
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    res.status(200).json({ configured: true, events });
  } catch (err) {
    res.status(502).json({ configured: true, error: 'No se pudo leer el calendario.', events: [] });
  }
}
