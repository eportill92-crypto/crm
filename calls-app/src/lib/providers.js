import { getGoogleToken } from './googleAuth';
import { getMicrosoftToken } from './microsoftAuth';

export function detectPlatform(text = '') {
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

export async function fetchGoogleEvents({ from, to }) {
  const token = getGoogleToken();
  if (!token) return [];

  const params = new URLSearchParams({
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Calendar respondió ${res.status}`);
  const data = await res.json();

  return (data.items || [])
    .filter((e) => e.start?.dateTime && e.end?.dateTime && e.status !== 'cancelled')
    .map((e) => {
      const joinUrl =
        e.hangoutLink ||
        e.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri ||
        extractUrl(e.location || '') ||
        extractUrl(e.description || '');
      return {
        id: `google-${e.id}`,
        title: e.summary || '(Sin título)',
        start: new Date(e.start.dateTime),
        end: new Date(e.end.dateTime),
        joinUrl,
        platform: detectPlatform(joinUrl),
        source: 'Google Calendar',
      };
    });
}

export async function fetchMicrosoftEvents({ from, to }) {
  const token = await getMicrosoftToken();
  if (!token) return [];

  const params = new URLSearchParams({
    startDateTime: from.toISOString(),
    endDateTime: to.toISOString(),
  });

  const res = await fetch(`https://graph.microsoft.com/v1.0/me/calendarview?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Prefer: 'outlook.timezone="UTC"',
    },
  });
  if (!res.ok) throw new Error(`Microsoft Graph respondió ${res.status}`);
  const data = await res.json();

  return (data.value || []).map((e) => {
    const joinUrl = e.onlineMeeting?.joinUrl || extractUrl(e.location?.displayName || '') || extractUrl(e.bodyPreview || '');
    return {
      id: `microsoft-${e.id}`,
      title: e.subject || '(Sin título)',
      start: new Date(`${e.start.dateTime}Z`),
      end: new Date(`${e.end.dateTime}Z`),
      joinUrl,
      platform: detectPlatform(joinUrl),
      source: 'Microsoft 365',
    };
  });
}
