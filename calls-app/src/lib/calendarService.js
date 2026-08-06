import { PROVIDERS, detectPlatform } from './providers';
import { buildMockEventsForDay } from '../data/mockEvents';

const USE_MOCK_DATA = true; // pasa a false cuando haya proveedores conectados

export async function getEventsForDay(day) {
  if (USE_MOCK_DATA) {
    return buildMockEventsForDay(day)
      .map((e) => ({ ...e, platform: detectPlatform(e.joinUrl) }))
      .sort((a, b) => a.start - b.start);
  }

  const results = await Promise.all(
    Object.values(PROVIDERS)
      .filter((p) => p.connected)
      .map((p) => p.getEvents({ from: day }))
  );

  return results
    .flat()
    .map((e) => ({ ...e, platform: e.platform || detectPlatform(e.joinUrl) }))
    .sort((a, b) => a.start - b.start);
}

export function getConnectionStatus() {
  return Object.values(PROVIDERS).map((p) => ({ id: p.id, label: p.label, connected: p.connected }));
}
