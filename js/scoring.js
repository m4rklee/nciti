/**
 * 保命TI计分引擎
 * 判定顺序：隐藏款 → 彩蛋 → HHHH 兜底 → 最高核心（平局破平）
 */

import {
  SCHOOL_TAGS,
  SCHOOLS,
  SCORABLE_CORES,
  EASTER_EGGS,
  PERSONALITIES,
} from './data.js';
import { getQuestions } from './content.js';

/**
 * @param {string[]} answers - 长度 20，每项为 'A'|'B'|'C'|'D'
 * @param {{ random?: () => number }} [opts]
 * @returns {{ typeId: string, scores: Record<string, number>, schoolTotals: Record<string, number>, path: string }}
 */
export function scoreAnswers(answers, opts = {}) {
  const scores = tallyScores(answers);
  const schoolTotals = computeSchoolTotals(scores);
  // 默认用答卷生成稳定伪随机数：相同答案始终得到相同结果，便于复测与分享。
  const random = opts.random || seededRandom(answers.join(''));
  return pickResult(scores, answers, schoolTotals, random);
}

/** @param {string[]} answers */
export function tallyScores(answers) {
  const questions = getQuestions();
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new Error(`需要 ${questions.length} 个答案，收到 ${answers?.length ?? 0}`);
  }
  const scores = {};
  for (let i = 0; i < questions.length; i++) {
    const key = answers[i];
    const opt = questions[i].options.find((o) => o.key === key);
    if (!opt) throw new Error(`Q${i + 1} 无效选项: ${key}`);
    scores[opt.tag] = (scores[opt.tag] || 0) + 1;
  }
  return scores;
}

export function computeSchoolTotals(scores) {
  return {
    [SCHOOLS.BARE]: sumSchool(scores, SCHOOLS.BARE),
    [SCHOOLS.SYSTEM]: sumSchool(scores, SCHOOLS.SYSTEM),
    [SCHOOLS.FANTASY]: sumSchool(scores, SCHOOLS.FANTASY),
    [SCHOOLS.MYSTIC]: sumSchool(scores, SCHOOLS.MYSTIC),
  };
}

/**
 * 纯判定（便于单测 HHHH：可传入不命中任何彩蛋的 answers 占位）
 * @param {Record<string, number>} scores
 * @param {string[]} answers
 * @param {Record<string, number>} schoolTotals
 * @param {() => number} random
 */
export function pickResult(scores, answers, schoolTotals, random = Math.random) {
  // 1) 隐藏款
  if (schoolTotals[SCHOOLS.BARE] >= 8 && schoolTotals[SCHOOLS.SYSTEM] === 0) {
    return pack('VOID', scores, schoolTotals, 'hidden');
  }
  if (schoolTotals[SCHOOLS.SYSTEM] >= 8 && schoolTotals[SCHOOLS.BARE] === 0) {
    return pack('MAXED', scores, schoolTotals, 'hidden');
  }

  const maxCore = Math.max(...SCORABLE_CORES.map((id) => scores[id] || 0), 0);

  // 2) 百搭兜底：所有核心都没有形成方向时优先输出。
  // 原方案附带“无彩蛋”会与 20 题结构冲突（低核心必然选到彩蛋），因此以无核心偏向为准。
  const allCoreLow = SCORABLE_CORES.every((id) => (scores[id] || 0) <= 1);
  if (allCoreLow) {
    return pack('HHHH', scores, schoolTotals, 'fallback');
  }

  // 3) 非玄学彩蛋：专属题命中 + 该彩蛋得分=1 + 任意核心均 <= 2。
  if (maxCore <= 2) {
    for (const [eggId, rule] of Object.entries(EASTER_EGGS)) {
      if (rule.q === 11) continue;
      if (answers[rule.q] === rule.opt && (scores[eggId] || 0) === 1) {
        return pack(eggId, scores, schoolTotals, 'easter');
      }
    }
  }

  // 4) 只有两分封顶的 TECHIE / COHO 若形成唯一最高分，优先承认明确偏向。
  const topCoreIds = SCORABLE_CORES.filter((id) => (scores[id] || 0) === maxCore);
  if (maxCore === 2 && topCoreIds.length === 1 && ['TECHIE', 'COHO'].includes(topCoreIds[0])) {
    return pack(topCoreIds[0], scores, schoolTotals, 'core');
  }

  // 5) Q12 玄学彩蛋：存在一定人格方向（最高核心恰为 2）时解锁。
  if (maxCore === 2) {
    for (const [eggId, rule] of Object.entries(EASTER_EGGS)) {
      if (rule.q !== 11) continue;
      if (answers[rule.q] === rule.opt && (scores[eggId] || 0) === 1) {
        return pack(eggId, scores, schoolTotals, 'easter');
      }
    }
  }

  // 6) 最高分核心；平局比流派总分；仍平局稳定伪随机
  let bestScore = -1;
  const tied = [];
  for (const id of SCORABLE_CORES) {
    const s = scores[id] || 0;
    if (s > bestScore) {
      bestScore = s;
      tied.length = 0;
      tied.push(id);
    } else if (s === bestScore) {
      tied.push(id);
    }
  }

  if (tied.length === 1) {
    return pack(tied[0], scores, schoolTotals, 'core');
  }

  let bestSchool = -1;
  const schoolTied = [];
  for (const id of tied) {
    const school = PERSONALITIES[id].school;
    const st = schoolTotals[school] || 0;
    if (st > bestSchool) {
      bestSchool = st;
      schoolTied.length = 0;
      schoolTied.push(id);
    } else if (st === bestSchool) {
      schoolTied.push(id);
    }
  }

  if (schoolTied.length === 1) {
    return pack(schoolTied[0], scores, schoolTotals, 'core');
  }

  const pick = schoolTied[Math.floor(random() * schoolTied.length)];
  return pack(pick, scores, schoolTotals, 'core');
}

function sumSchool(scores, school) {
  const tags = SCHOOL_TAGS[school] || [];
  return tags.reduce((n, tag) => n + (scores[tag] || 0), 0);
}

function pack(typeId, scores, schoolTotals, path) {
  return { typeId, scores, schoolTotals, path };
}

function seededRandom(seed) {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return () => {
    value += 0x6d2b79f5;
    let n = value;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
