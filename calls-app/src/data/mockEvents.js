// Datos de ejemplo para el prototipo visual. Cuando se conecten los
// proveedores reales (ver src/lib/providers.js) esta función se elimina y
// los eventos vienen de calendarService.getEventsForDay().

function atTime(baseDate, hours, minutes = 0) {
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function buildMockEventsForDay(day) {
  const weekday = day.getDay(); // 0 = domingo

  const events = [
    {
      id: 'standup',
      title: '1:1 Gian <> Edu',
      start: atTime(day, 9, 30),
      end: atTime(day, 10, 0),
      joinUrl: 'https://meet.google.com/abc-defg-hij',
      source: 'Google Calendar',
    },
    {
      id: 'review',
      title: 'Data - Monthly Review',
      start: atTime(day, 14, 0),
      end: atTime(day, 15, 0),
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/mock',
      source: 'Microsoft Teams',
    },
  ];

  if (weekday !== 0 && weekday !== 6) {
    events.push({
      id: 'seguimiento',
      title: 'Seguimiento Ladera',
      start: atTime(day, 19, 30),
      end: atTime(day, 20, 30),
      joinUrl: 'https://zoom.us/j/1234567890',
      source: 'Zoom',
    });
  }

  return events;
}
