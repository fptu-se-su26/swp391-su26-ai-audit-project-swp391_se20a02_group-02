import type maplibregl from 'maplibre-gl';

const GOONG_MAPTILES_KEY = (import.meta as any).env.VITE_GOONG_MAPTILES_KEY || 'mock_goong_key';

export const hasGoongMaptilesKey = Boolean(GOONG_MAPTILES_KEY && GOONG_MAPTILES_KEY !== 'mock_goong_key');

export const getFallbackMapStyleUrl = (isDark = false): string =>
  isDark
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export const getMapStyleUrl = (isDark = false): string => {
  if (!hasGoongMaptilesKey) return getFallbackMapStyleUrl(isDark);

  const style = isDark ? 'goong_map_dark.json' : 'goong_map_web.json';
  return `https://tiles.goong.io/assets/${style}?api_key=${GOONG_MAPTILES_KEY}`;
};

export const installMapStyleFallback = (map: maplibregl.Map, isDark = false): void => {
  if (!hasGoongMaptilesKey) return;

  let fallbackApplied = false;
  map.on('error', (event: any) => {
    if (fallbackApplied) return;

    const message = String(event?.error?.message || event?.error || '');
    const source = String(event?.sourceId || event?.style?.sprite || '');
    const isGoongFailure =
      message.includes('goong') ||
      message.includes('tiles.goong') ||
      message.includes('403') ||
      message.includes('Forbidden') ||
      source.includes('goong');

    if (!isGoongFailure) return;
    fallbackApplied = true;
    map.setStyle(getFallbackMapStyleUrl(isDark));
  });
};
