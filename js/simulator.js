import { SCHOOLS } from './data.js';
import { getProfile, SIM_EVENTS } from './experience-data.js';

function hash(text) {
  let n = 2166136261;
  for (const ch of text) {
    n ^= ch.charCodeAt(0);
    n = Math.imul(n, 16777619);
  }
  return () => {
    n += 0x6d2b79f5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setup(typeId, replacement) {
  const p = getProfile(typeId);
  const base = {
    cash: 62,
    health: 62,
    family: 58,
    retire: 52,
  };
  const shield = { cash: 0, health: 0, family: 0, retire: 0 };

  if (p.school === SCHOOLS.SYSTEM) Object.assign(shield, { cash: 10, health: 12, family: 8, retire: 10 });
  if (p.school === SCHOOLS.BARE) Object.assign(shield, { cash: -4, health: -6, family: 0, retire: -5 });
  if (p.school === SCHOOLS.FANTASY) Object.assign(shield, { cash: 0, health: 1, family: 6, retire: 3 });
  if (p.school === SCHOOLS.MYSTIC) Object.assign(shield, { cash: 0, health: 2, family: 1, retire: -2 });
  if (typeId === 'MAXED') Object.assign(shield, { cash: 18, health: 18, family: 16, retire: 18 });
  if (typeId === 'VOID') Object.assign(shield, { cash: -9, health: -9, family: -4, retire: -10 });
  if (typeId === 'HHHH') Object.assign(shield, { cash: 4, health: 4, family: 4, retire: 4 });

  if (replacement && replacement !== 'native') {
    shield[replacement] += 8;
  }

  return { profile: p, base, shield };
}

export function createSimulation(typeId, replacement = 'native') {
  const { profile, base, shield } = setup(typeId, replacement);
  const random = hash(`${typeId}:${replacement}`);
  const state = { ...base };
  let index = 0;
  const history = [];

  function next() {
    if (index >= SIM_EVENTS.length) return null;
    const event = SIM_EVENTS[index++];
    const luck = Math.round((random() - 0.5) * 8);
    const protection = shield[event.risk] || 0;
    const loss = Math.max(4, event.cost - protection + luck);
    state[event.risk] = Math.max(0, state[event.risk] - loss);
    // 时间也会自然消耗现金，但良好的长期规划可以抵消一部分。
    if (event.risk !== 'cash') state.cash = Math.max(0, state.cash - Math.max(1, Math.round(loss / 5)));
    const protectedEvent = protection >= 8;
    const snapshot = {
      ...event,
      loss,
      protected: protectedEvent,
      outcome: protectedEvent ? event.good : `这次事件消耗了 ${loss} 点${metricLabel(event.risk)}。`,
      state: { ...state },
      step: index,
      total: SIM_EVENTS.length,
    };
    history.push(snapshot);
    return snapshot;
  }

  function report() {
    const average = Math.round(Object.values(state).reduce((a, b) => a + b, 0) / 4);
    const grade = average >= 57 ? '安稳人生' : average >= 38 ? '普通人生' : '危机人生';
    const weakest = Object.entries(state).sort((a, b) => a[1] - b[1])[0][0];
    const advice = {
      cash: '优先准备可覆盖数月日常开支的应急资金，让计划外支出不打乱生活。',
      health: '规律体检、健康习惯与基础医疗安排可以共同降低突发状况的冲击。',
      family: '尽早和家人聊清照护意愿、联系人与可用资源，会比临时决定更从容。',
      retire: '把理想晚年拆成年度储蓄目标、居住选择和照护方案，愿景才会逐步落地。',
    }[weakest];
    return { profile, state: { ...state }, average, grade, weakest, advice, history: [...history] };
  }

  return { profile, state, shield, next, report, get done() { return index >= SIM_EVENTS.length; } };
}

export function metricLabel(key) {
  return { cash: '现金流', health: '健康值', family: '家庭支援', retire: '养老蓄能' }[key] || key;
}
