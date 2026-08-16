const COLLECTION_KEY = 'baoming-ti.collection.v2';
const STATS_KEY = 'baoming-ti.stats.v2';

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function unlockPersonality(typeId) {
  const collection = read(COLLECTION_KEY, []);
  if (!collection.includes(typeId)) {
    collection.push(typeId);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
  }
  track('result', typeId);
  return collection;
}

export function getCollection() {
  return read(COLLECTION_KEY, []);
}

export function track(event, value = '') {
  const stats = read(STATS_KEY, {});
  const key = value ? `${event}:${value}` : event;
  stats[key] = (stats[key] || 0) + 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getLocalStats() {
  return read(STATS_KEY, {});
}
