const PLATFORM_META = {
  meet: { label: 'Meet', color: '#1a73e8', bg: '#e8f0fe' },
  teams: { label: 'Teams', color: '#5b5fc7', bg: '#eeeefa' },
  zoom: { label: 'Zoom', color: '#2d8cff', bg: '#e6f2ff' },
  phone: { label: 'Llamada', color: '#616161', bg: '#eeeeee' },
  other: { label: 'Otro', color: '#616161', bg: '#eeeeee' },
};

export default function PlatformBadge({ platform }) {
  const meta = PLATFORM_META[platform] || PLATFORM_META.other;
  return (
    <span
      className="platform-badge"
      style={{ color: meta.color, background: meta.bg }}
    >
      {meta.label}
    </span>
  );
}
