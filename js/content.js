/**
 * 运行时题库加载器 + 内容校验
 *
 * data.js 是「出厂默认 + 回退 + 恢复默认按钮」的内容源,
 * data/content.json 是「线上数据源」(站长经管理页在线编辑后由帽子云重建发布)。
 *
 * 模块顶层零副作用(Node 单测可直接 import);所有导出函数见下。
 */

import { QUESTIONS, PERSONALITIES, EASTER_EGGS } from './data.js';

const FETCH_TIMEOUT_MS = 8000;

/** 模块级可变题库;loadContent 校验通过后原子替换 */
let current = QUESTIONS;
let currentEggs = EASTER_EGGS;
let currentVersion = '';

/**
 * 校验线上题库结构。纯函数,可单测。
 * 约束:恰好 20 题 × 4 选项(key 恰为 A-D 各一次);
 *       tag 必须在 allowedTags 内 —— 与 scoring 的彩蛋下标判定强相关。
 *       easterEggs 可选:缺省回退 data.js 内置 EASTER_EGGS;
 *       存在时:key 必须是 kind=easter 的人格 id,rule 为 { q: 0-19 整数, opt: A-D },
 *       (q,opt) 两两不重复(重复时判定顺序歧义)。
 * @param {unknown} input
 * @param {string[]} allowedTags
 * @returns {{ ok: boolean, questions?: unknown[], easterEggs?: Record<string, { q: number, opt: string }>, errors?: Array<{ q: number|string, field: string, message: string }> }}
 */
export function validateContent(input, allowedTags) {
  const errors = [];
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, errors: [{ q: 'global', field: 'questions', message: '内容不是对象' }] };
  }

  const { questions, version } = input;
  if (version !== undefined && typeof version !== 'string') {
    errors.push({ q: 'global', field: 'version', message: 'version 必须为字符串' });
  }

  if (!Array.isArray(questions)) {
    errors.push({ q: 'global', field: 'questions', message: '缺少 questions 数组' });
    return { ok: false, errors };
  }
  if (questions.length !== 20) {
    errors.push({ q: 'global', field: 'questions', message: `必须恰好 20 题,收到 ${questions.length} 题` });
    return { ok: false, errors };
  }

  const seenIds = new Set();
  const allowed = new Set(allowedTags);

  questions.forEach((q, i) => {
    if (typeof q !== 'object' || q === null) {
      errors.push({ q: i, field: 'question', message: `Q${i + 1} 不是对象` });
      return;
    }

    if (typeof q.id !== 'string' || q.id.trim() === '') {
      errors.push({ q: i, field: 'id', message: `Q${i + 1} 缺少 id` });
    } else if (seenIds.has(q.id)) {
      errors.push({ q: i, field: 'id', message: `Q${i + 1} 的 id「${q.id}」重复` });
    }
    seenIds.add(q.id);

    if (typeof q.section !== 'string' || q.section.trim() === '') {
      errors.push({ q: i, field: 'section', message: `Q${i + 1} 缺少章节(section)` });
    }
    if (typeof q.text !== 'string' || q.text.trim() === '') {
      errors.push({ q: i, field: 'text', message: `Q${i + 1} 题干为空` });
    }

    if (!Array.isArray(q.options)) {
      errors.push({ q: i, field: 'options', message: `Q${i + 1} 缺少 options` });
      return;
    }
    if (q.options.length !== 4) {
      errors.push({ q: i, field: 'options', message: `Q${i + 1} 必须恰好 4 个选项,收到 ${q.options.length} 个` });
    }

    const seenKeys = new Set();
    q.options.forEach((opt, j) => {
      if (typeof opt !== 'object' || opt === null) {
        errors.push({ q: i, field: `options[${j}]`, message: `Q${i + 1} 选项 ${j + 1} 不是对象` });
        return;
      }
      if (seenKeys.has(opt.key)) {
        errors.push({ q: i, field: `options[${j}].key`, message: `Q${i + 1} 选项 key「${opt.key}」重复` });
      }
      seenKeys.add(opt.key);
      if (!['A', 'B', 'C', 'D'].includes(opt.key)) {
        errors.push({ q: i, field: `options[${j}].key`, message: `Q${i + 1} 选项 key「${opt.key}」非法,只允许 A/B/C/D` });
      }
      if (typeof opt.text !== 'string' || opt.text.trim() === '') {
        errors.push({ q: i, field: `options[${j}].text`, message: `Q${i + 1} 选项 ${opt.key} 文案为空` });
      }
      if (typeof opt.tag !== 'string' || opt.tag.trim() === '') {
        errors.push({ q: i, field: `options[${j}].tag`, message: `Q${i + 1} 选项 ${opt.key} 缺少 tag` });
      } else if (!allowed.has(opt.tag)) {
        errors.push({ q: i, field: `options[${j}].tag`, message: `Q${i + 1} 选项 ${opt.key} 的 tag「${opt.tag}」不在人格表内` });
      }
    });
  });

  // easterEggs 可选:缺省回退 data.js 内置(兼容旧版 content.json)
  const easterEggs = input.easterEggs === undefined ? EASTER_EGGS : input.easterEggs;
  if (easterEggs !== EASTER_EGGS) {
    validateEasterEggs(easterEggs, errors, questions.length);
  }

  return errors.length
    ? { ok: false, errors }
    : { ok: true, questions, easterEggs };
}

/**
 * 彩蛋表结构校验(见 validateContent 头部注释)。
 * @param {unknown} eggs
 * @param {Array<{ q: number|string, field: string, message: string }>} errors
 * @param {number} questionCount
 */
function validateEasterEggs(eggs, errors, questionCount) {
  if (typeof eggs !== 'object' || eggs === null || Array.isArray(eggs)) {
    errors.push({ q: 'global', field: 'easterEggs', message: 'easterEggs 必须是对象' });
    return;
  }
  const seenPos = new Set();
  for (const [eggId, rule] of Object.entries(eggs)) {
    if (PERSONALITIES[eggId]?.kind !== 'easter') {
      errors.push({ q: eggId, field: 'easterEggs', message: `彩蛋人格「${eggId}」不存在或不是彩蛋类(kind=easter)` });
      continue;
    }
    if (typeof rule !== 'object' || rule === null) {
      errors.push({ q: eggId, field: 'easterEggs', message: `彩蛋「${eggId}」的规则不是对象` });
      continue;
    }
    if (!Number.isInteger(rule.q) || rule.q < 0 || rule.q >= questionCount) {
      errors.push({ q: eggId, field: 'easterEggs', message: `彩蛋「${eggId}」的题号 q=${rule.q} 非法(需 0-${questionCount - 1} 整数)` });
    }
    if (!['A', 'B', 'C', 'D'].includes(rule.opt)) {
      errors.push({ q: eggId, field: 'easterEggs', message: `彩蛋「${eggId}」的选项 opt=${rule.opt} 非法,只允许 A/B/C/D` });
    }
    if (Number.isInteger(rule.q) && ['A', 'B', 'C', 'D'].includes(rule.opt)) {
      const pos = `${rule.q}:${rule.opt}`;
      if (seenPos.has(pos)) {
        errors.push({ q: eggId, field: 'easterEggs', message: `彩蛋「${eggId}」与另一彩蛋共用触发位 Q${rule.q + 1}-${rule.opt},判定顺序歧义` });
      }
      seenPos.add(pos);
    }
  }
}

/** 同步返回当前生效题库(未加载线上内容时 = data.js 默认) */
export function getQuestions() {
  return current;
}

/** 同步返回当前生效彩蛋表(未加载线上内容时 = data.js 默认) */
export function getEasterEggs() {
  return currentEggs;
}

/** 当前生效题库版本号(线上未加载成功时为空串) */
export function getContentVersion() {
  return currentVersion;
}

/**
 * 拉取线上题库 data/content.json。
 * 任何失败(网络 / 404 / JSON 语法错 / 校验不过)都不抛异常,
 * 保持回退到内置默认题库,保证答题永不白屏。
 * @param {string} [url]
 * @returns {Promise<{ source: 'remote', version: string } | { source: 'default', errors?: unknown }>}
 */
export async function loadContent(url = './data/content.json') {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let res;
    try {
      // ?t= 破 CDN/浏览器缓存:content.json 会随帽子云重建更新
      res = await fetch(`${url}?t=${Date.now()}`, { signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const result = validateContent(json, Object.keys(PERSONALITIES));
    if (!result.ok) {
      console.warn('[content] 线上题库校验未通过,回退默认题库', result.errors);
      return { source: 'default', errors: result.errors };
    }
    current = result.questions;
    currentEggs = result.easterEggs;
    currentVersion = typeof json.version === 'string' ? json.version : '';
    return { source: 'remote', version: currentVersion };
  } catch (err) {
    console.warn('[content] 线上题库加载失败,回退默认题库:', err?.message ?? err);
    return { source: 'default' };
  }
}
