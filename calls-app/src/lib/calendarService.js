import { fetchMicrosoftEvents, detectPlatform } from './providers';
import { fetchGoogleIcalEvents } from './googleIcal';
import { buildMockEventsForDay } from '../data/mockEvents';

function dayRange(day) {
  const from = new Date(day);
  from.setHours(0, 0, 0, 0);
  const to = new Date(day);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export async function getEventsForDay(day, connections) {
  if (!connections.google && !connections.microsoft) {
    const events = buildMockEventsForDay(day)
      .map((e) => ({ ...e, platform: detectPlatform(e.joinUrl) }))
      .sort((a, b) => a.start - b.start);
    return { events, errors: [] };
  }

  const range = dayRange(day);
  const tasks = [];
  if (connections.google) tasks.push(fetchGoogleIcalEvents(range).catch((err) => ({ __error: err })));
  if (connections.microsoft) tasks.push(fetchMicrosoftEvents(range).catch((err) => ({ __error: err })));

  const results = await Promise.all(tasks);
  const errors = results.filter((r) => r && r.__error).map((r) => r.__error);
  const events = results
    .filter((r) => Array.isArray(r))
    .flat()
    .sort((a, b) => a.start - b.start);

  return { events, errors };
}
