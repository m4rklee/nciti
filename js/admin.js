/**
 * 题库管理页逻辑 —— 经 GitHub Contents API 读写 data/content.json。
 * 数据源是仓库 m4rklee/nciti,帽子云检测 push 后自动重建发布。
 */

import { PERSONALITIES, SCHOOL_LABELS, EASTER_EGGS, QUESTIONS } from './data.js';
import { validateContent } from './content.js';

const REPO = 'm4rklee/nciti';
const CONTENT_PATH = 'data/content.json';
const BRANCH = 'main';
const PAT_KEY = 'nciti.gh.pat';
const API_BASE = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 15000;
const RETRY_DELAYS = [1000, 3000, 8000];

const $ = (sel) => document.querySelector(sel);
const views = {
  login: $('#view-login'),
  loading: $('#view-loading'),
  error: $('#view-error'),
  editor: $('#view-editor'),
};

/** 页面状态 */
let pat = localStorage.getItem(PAT_KEY) || '';
let sha = null; // 远程 content.json 的 blob sha(PUT 防覆盖必需)
let remoteVersion = '';
let demoMode = false; // 仅查看模式:不连 GitHub
let dirty = false;
let eggs = EASTER_EGGS; // 当前生效彩蛋表(与 questions 一同来自线上内容)

/* ---------------- 工具 ---------------- */

/** UTF-8 → base64(中文题干必须走 TextEncoder,btoa 直接处理中文会炸) */
function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** base64 → UTF-8 文本 */
function decodeBase64(b64) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 版本号自动 bump:0.1.0 → 0.1.1;解析不了则原样返回 */
function bumpVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v ?? '');
  if (!m) return v ?? '';
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
}

/** 网络错误/5xx 重试(退避);4xx 不重试 */
async function withRetry(fn, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1 && (err instanceof TypeError || (err.status >= 500 && err.status < 600))) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[i] ?? 1000));
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

/** GitHub API 封装:统一超时 + 鉴权头 */
async function ghFetch(path, { method = 'GET', body } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(pat ? { Authorization: `Bearer ${pat}` } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      try {
        const data = await res.json();
        err.message = `${data.message ?? '请求失败'}`;
        err.ghMessage = data.message;
      } catch { /* 忽略响应体解析失败 */ }
      throw err;
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error('请求超时');
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- 视图切换 ---------------- */

function showView(name) {
  for (const [key, el] of Object.entries(views)) el.hidden = key !== name;
}

function showError(title, detail) {
  $('#error-detail').textContent = `${title}${detail ? `\n${detail}` : ''}`;
  showView('error');
}

function toast(msg) {
  const el = $('#toast-el') ?? (() => {
    const t = document.createElement('div');
    t.id = 'toast-el';
    t.className = 'toast';
    t.hidden = true;
    document.body.appendChild(t);
    return t;
  })();
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 4000);
}

/* ---------------- 登录 ---------------- */

$('#btn-login').addEventListener('click', async () => {
  const input = $('#pat-input');
  const token = input.value.trim();
  const errEl = $('#login-error');
  if (!token) {
    errEl.textContent = '请粘贴 GitHub Token';
    errEl.hidden = false;
    return;
  }
  errEl.hidden = true;
  pat = token;
  localStorage.setItem(PAT_KEY, token);
  await enterEditorFlow();
});

// 演示模式:不连 GitHub,直接读同源 data/content.json 渲染表单
$('#btn-login-demo').addEventListener('click', async () => {
  $('#login-error').hidden = true;
  demoMode = true;
  pat = '';
  showView('loading');
  try {
    const res = await fetch(`./data/content.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const result = validateContent(json, Object.keys(PERSONALITIES));
    sha = null;
    remoteVersion = json.version;
    eggs = json.easterEggs ?? EASTER_EGGS;
    renderEditor(result.ok ? result.questions : json.questions, result.ok ? null : result);
    updateStatus('演示模式(本地内容,不会保存)');
    $('#btn-save').disabled = true;
  } catch (err) {
    showError('演示模式加载失败', err?.message ?? String(err));
  }
});

$('#btn-back-login').addEventListener('click', () => {
  localStorage.removeItem(PAT_KEY);
  pat = '';
  $('#pat-input').value = '';
  showView('login');
});

/* ---------------- 拉取远程内容 ---------------- */

async function enterEditorFlow() {
  showView('loading');
  try {
    await loadFromGitHub();
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      showError('Token 无效或无权限', `${err.message}\n请在 GitHub → Settings → Developer settings → Personal access tokens 检查(需授权 ${REPO} 的 Contents: Read and write)。`);
    } else if (err.status === 429) {
      showError('GitHub API 限流', '请求过于频繁,稍后重试。');
    } else {
      showError('无法连接 GitHub', `${err.message ?? err}\n大陆网络偶发失败,可点「重试」,或使用「复制手动提交内容」兜底。`);
    }
  }
}

async function loadFromGitHub() {
  let data;
  let notFound = false;
  try {
    data = await withRetry(() => ghFetch(`/repos/${REPO}/contents/${CONTENT_PATH}?ref=${BRANCH}`));
  } catch (err) {
    if (err.status === 404) notFound = true; // 仓库还没有 content.json,首次接入
    else throw err;
  }

  let json;
  if (notFound) {
    sha = null;
    remoteVersion = '';
    eggs = EASTER_EGGS;
    json = { version: '', questions: QUESTIONS };
    renderEditor(QUESTIONS, null);
    updateStatus('仓库尚无 content.json,保存将新建文件');
    return;
  }

  sha = data.sha;
  let parsed;
  try {
    parsed = JSON.parse(decodeBase64(data.content));
  } catch {
    // 远程内容损坏:仍渲染原始文本不可行,回退默认题库并警告,站长可恢复默认
    sha = null;
    eggs = EASTER_EGGS;
    json = { version: '', questions: QUESTIONS };
    renderEditor(QUESTIONS, null);
    updateStatus('远程 content.json 损坏,已回退默认题库。点「保存」或「恢复默认题库」修复');
    return;
  }

  remoteVersion = parsed.version ?? '';
  eggs = parsed.easterEggs ?? EASTER_EGGS;
  const result = validateContent(parsed, Object.keys(PERSONALITIES));
  renderEditor(parsed.questions, result.ok ? null : result);
  updateStatus(
    `已连接 ${REPO}${notFound ? '' : ` · ${CONTENT_PATH} · sha ${sha.slice(0, 7)}`}${remoteVersion ? ` · version ${remoteVersion}` : ''}`,
  );
}

/* ---------------- 编辑器渲染 ---------------- */

/** 彩蛋位映射 q(0-based):opt → 人格 id(按当前生效彩蛋表实时构建) */
function buildEggMap() {
  const m = {};
  for (const [eggId, rule] of Object.entries(eggs)) m[`${rule.q}:${rule.opt}`] = eggId;
  return m;
}

/** 题号下拉(Q1-Q20,value=0-based 下标) */
function qOptionsHTML(selected) {
  let html = '';
  for (let i = 0; i < 20; i++) {
    const sel = i === selected ? ' selected' : '';
    html += `<option value="${i}"${sel}>Q${i + 1}</option>`;
  }
  return html;
}

/** 选项下拉(A-D) */
function optOptionsHTML(selected) {
  return ['A', 'B', 'C', 'D'].map((k) => `<option value="${k}"${k === selected ? ' selected' : ''}>选项 ${k}</option>`).join('');
}

/** 按流派分组的人格下拉选项 */
function tagOptionsHTML(selected) {
  const bySchool = new Map();
  for (const id of Object.keys(PERSONALITIES)) {
    const school = PERSONALITIES[id].school;
    if (!bySchool.has(school)) bySchool.set(school, []);
    bySchool.get(school).push(id);
  }
  let html = '';
  for (const [school, ids] of bySchool) {
    html += `<optgroup label="${SCHOOL_LABELS[school] ?? school}">`;
    for (const id of ids) {
      const sel = id === selected ? ' selected' : '';
      html += `<option value="${id}"${sel}>${id} · ${PERSONALITIES[id].zh}</option>`;
    }
    html += '</optgroup>';
  }
  return html;
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function renderEditor(questions, validation) {
  // 所有成功渲染路径(加载/演示/保存/刷新/恢复)都应停留在编辑器视图,
  // 在此统一切换,避免调用方遗漏导致卡在加载视图。
  showView('editor');
  const form = $('#editor-form');
  const eggMap = buildEggMap();
  const fieldsets = questions.map((q, i) => {
    const optionsRows = q.options.map((opt) => {
      const eggId = eggMap[`${i}:${opt.key}`];
      const eggBadge = eggId
        ? `<span class="egg-badge" title="彩蛋位:选项 ${opt.key} 指向人格「${eggId} · ${PERSONALITIES[eggId]?.zh}」。改动该选项的 tag 会使此彩蛋判定失效">彩蛋位 ✦</span>`
        : '';
      return `
        <div class="q-option">
          <span class="key-badge">${opt.key}</span>
          <input type="text" data-q="${i}" data-field="options[${i}].text" value="${esc(opt.text)}" placeholder="选项文案" />
          <select class="tag-select" data-q="${i}" data-field="options[${i}].tag" title="该选项指向的人格(tag)">${tagOptionsHTML(opt.tag)}</select>${eggBadge}
        </div>`;
    }).join('');
    return `
      <fieldset class="q-fieldset">
        <legend>Q${i + 1}</legend>
        <div class="q-field">
          <label>章节 section</label>
          <input type="text" data-q="${i}" data-field="section" value="${esc(q.section)}" />
        </div>
        <div class="q-field">
          <label>题干</label>
          <textarea data-q="${i}" data-field="text" rows="2">${esc(q.text)}</textarea>
        </div>
        ${optionsRows}
      </fieldset>`;
  }).join('');
  form.innerHTML = fieldsets;

  $('#warning-banner').hidden = true;
  $('#errors-list').hidden = true;
  if (validation && validation.errors) {
    const banner = $('#warning-banner');
    banner.textContent = '远程题库校验未通过(列表见下)。你可以先修正再保存,或点「恢复默认题库」一键重置。';
    banner.hidden = false;
    showValidationErrors(validation.errors);
  }

  form.querySelectorAll('input, textarea, select').forEach((el) => {
    el.addEventListener('input', () => markDirty(true));
    el.addEventListener('change', () => markDirty(true));
  });
  renderEggPanel();
  markDirty(false);
}

/* ---------------- 彩蛋位设置面板 ---------------- */

/**
 * 渲染彩蛋位面板:每行一个彩蛋(人格 + 触发题号 + 选项 + 删除),
 * 底部一行添加入口(未占用触发位的彩蛋人格)。
 */
function renderEggPanel() {
  const panel = $('#egg-panel');
  const rows = Object.entries(eggs)
    .map(([id, rule]) => `
      <div class="egg-row" data-egg="${id}">
        <span class="egg-name">${id} · ${PERSONALITIES[id]?.zh ?? ''}</span>
        <select class="egg-q" data-egg="${id}">${qOptionsHTML(rule.q)}</select>
        <select class="egg-opt" data-egg="${id}">${optOptionsHTML(rule.opt)}</select>
        <button type="button" class="btn btn--ghost egg-del" data-egg="${id}">删除</button>
      </div>`)
    .join('');

  const unassigned = Object.keys(PERSONALITIES).filter((id) => PERSONALITIES[id].kind === 'easter' && !(id in eggs));
  const addRow = `
    <div class="egg-add">
      <select id="egg-add-id">
        <option value="">+ 选择彩蛋人格</option>
        ${unassigned.map((id) => `<option value="${id}">${id} · ${PERSONALITIES[id].zh}</option>`).join('')}
      </select>
      <select id="egg-add-q">${qOptionsHTML()}</select>
      <select id="egg-add-opt">${optOptionsHTML()}</select>
      <button type="button" class="btn" id="egg-add-btn">添加</button>
    </div>`;
  panel.innerHTML = rows + addRow;

  panel.querySelectorAll('.egg-q, .egg-opt').forEach((el) => {
    el.addEventListener('change', () => markDirty(true));
  });
  panel.querySelectorAll('.egg-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.egg;
      const zh = PERSONALITIES[id]?.zh ?? '';
      if (!window.confirm(`删除彩蛋「${id} · ${zh}」的触发位?删除后该彩蛋人格将无法被玩家获得。`)) return;
      delete eggs[id];
      markDirty(true);
      renderEggPanel();
    });
  });
  $('#egg-add-btn').addEventListener('click', () => {
    const id = $('#egg-add-id').value;
    const q = Number($('#egg-add-q').value);
    const opt = $('#egg-add-opt').value;
    if (!id) {
      alert('请先选择要新增彩蛋的人格');
      return;
    }
    const occupied = Object.values(eggs).some((r) => r.q === q && r.opt === opt);
    if (occupied) {
      alert(`Q${q + 1}-选项${opt} 已被其他彩蛋占用,请换一个触发位`);
      return;
    }
    eggs[id] = { q, opt };
    markDirty(true);
    renderEggPanel();
  });
}

function markDirty(isDirty) {
  dirty = isDirty;
  const dot = $('#status-dot');
  if (demoMode) return;
  dot.classList.toggle('status--dirty', isDirty);
  if (!isDirty) dot.classList.remove('status--dirty');
}

function showValidationErrors(errors) {
  const list = $('#errors-list');
  list.hidden = false;
  list.innerHTML = errors
    .map((e) => `• ${typeof e.q === 'number' ? `Q${e.q + 1}` : '全局'} [${e.field}] ${esc(e.message)}`)
    .join('<br>');
  const first = errors[0];
  if (typeof first.q === 'number') {
    const sel = `[data-q="${first.q}"][data-field="${first.field}"]`;
    const el = document.querySelector(sel);
    if (el) {
      el.classList.add('invalid');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

/* ---------------- 收集与保存 ---------------- */

function collectContent() {
  const questions = [];
  const form = $('#editor-form');
  const fieldsets = form.querySelectorAll('.q-fieldset');
  fieldsets.forEach((fs) => {
    const i = Number(fs.querySelector('input[data-field="section"]').dataset.q);
    const q = {
      id: `Q${i + 1}`,
      section: fs.querySelector('input[data-field="section"]').value.trim(),
      text: fs.querySelector('textarea[data-field="text"]').value.trim(),
      options: ['A', 'B', 'C', 'D'].map((key) => {
        const textEl = fs.querySelector(`input[data-q="${i}"][data-field="options[${i}].text"]`);
        const tagEl = fs.querySelector(`select[data-q="${i}"][data-field="options[${i}].tag"]`);
        return { key, text: textEl.value.trim(), tag: tagEl.value };
      }),
    };
    questions.push(q);
  });
  const easterEggs = {};
  document.querySelectorAll('#egg-panel .egg-row').forEach((row) => {
    const id = row.dataset.egg;
    easterEggs[id] = {
      q: Number(row.querySelector('.egg-q').value),
      opt: row.querySelector('.egg-opt').value,
    };
  });
  return { version: bumpVersion(remoteVersion), questions, easterEggs };
}

async function saveToGitHub(content, opts = {}) {
  const body = {
    message: opts.message ?? 'chore(data): 题库编辑 (admin)',
    content: toBase64(JSON.stringify(content, null, 2) + '\n'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  try {
    const res = await withRetry(() => ghFetch(`/repos/${REPO}/contents/${CONTENT_PATH}`, {
      method: 'PUT',
      body,
    }));
    sha = res.content?.sha ?? sha;
    remoteVersion = content.version;
    return true;
  } catch (err) {
    if (err.status === 409) {
      // 远程 sha 已变化(可能被其他途径修改):重取最新 sha 后确认覆盖
      const fresh = await withRetry(() => ghFetch(`/repos/${REPO}/contents/${CONTENT_PATH}?ref=${BRANCH}`));
      const ok = window.confirm(
        `远程 content.json 已被修改(sha ${fresh.sha.slice(0, 7)} ≠ 本地 ${sha?.slice(0, 7)})。\n继续保存将覆盖远程版本。确认?`,
      );
      if (!ok) return false;
      sha = fresh.sha;
      return saveToGitHub(content, opts); // 用新 sha 重发
    }
    if (err.status === 401 || err.status === 403) {
      showError('Token 无效或无权限', `${err.message}\n请检查 token 是否有效、是否授权了 ${REPO} 的 Contents 权限。`);
    } else {
      showError('保存失败', `${err.message ?? err}\n可重试,或使用「复制手动提交内容」兜底。`);
    }
    return false;
  }
}

$('#btn-save').addEventListener('click', async () => {
  if (demoMode) return;
  const btn = $('#btn-save');
  const content = collectContent();

  // 彩蛋可达性提醒(不阻断):彩蛋触发要求「答中触发位且该人格 tag 全程只出现一次」,
  // 若触发位选项的 tag 不是该彩蛋人格,彩蛋将无法触发。保存前复述后果。
  const eggWarnings = [];
  for (const [eggId, rule] of Object.entries(content.easterEggs)) {
    const q = content.questions[rule.q];
    const opt = q?.options.find((o) => o.key === rule.opt);
    if (opt && opt.tag !== eggId) {
      eggWarnings.push(`Q${rule.q + 1}-选项${rule.opt}「${eggId}」触发位指向的选项 tag 是「${opt.tag}」,该彩蛋将无法触发`);
    }
  }
  if (eggWarnings.length) {
    const ok = window.confirm(
      `以下彩蛋将无法触发:\n${eggWarnings.join('\n')}\n\n确认继续保存?`,
    );
    if (!ok) return;
  }

  const validation = validateContent(content, Object.keys(PERSONALITIES));
  if (!validation.ok) {
    $('#warning-banner').hidden = true;
    showValidationErrors(validation.errors);
    return;
  }

  btn.disabled = true;
  try {
    const saved = await saveToGitHub(content);
    if (saved) {
      eggs = content.easterEggs;
      renderEditor(content.questions, null);
      updateStatus(`已保存到 ${REPO} · sha ${sha.slice(0, 7)} · version ${remoteVersion}`);
      toast('已保存到 GitHub,帽子云检测到 push 后 1-3 分钟内全站生效');
    }
  } finally {
    btn.disabled = false;
  }
});

$('#btn-restore-default').addEventListener('click', async () => {
  if (demoMode) return;
  const ok = window.confirm('将用内置默认题库覆盖远程 content.json(20 题 × 4 选项 + 出厂彩蛋表),确认?');
  if (!ok) return;
  const content = { version: bumpVersion(remoteVersion), easterEggs: EASTER_EGGS, questions: QUESTIONS };
  const btn = $('#btn-restore-default');
  btn.disabled = true;
  try {
    const saved = await saveToGitHub(content, { message: 'chore(data): 恢复默认题库 (admin)' });
    if (saved) {
      eggs = EASTER_EGGS;
      renderEditor(QUESTIONS, null);
      updateStatus(`已恢复默认题库 · sha ${sha.slice(0, 7)}`);
      toast('已保存,帽子云 1-3 分钟内生效');
    }
  } finally {
    btn.disabled = false;
  }
});

$('#btn-refresh').addEventListener('click', async () => {
  if (dirty && !window.confirm('有未保存的修改,重新加载将丢弃。确认?')) return;
  if (demoMode) {
    const res = await fetch(`./data/content.json?t=${Date.now()}`);
    const json = await res.json();
    eggs = json.easterEggs ?? EASTER_EGGS;
    renderEditor(json.questions, null);
    return;
  }
  showView('loading');
  try {
    await loadFromGitHub();
  } catch (err) {
    showError('重新加载失败', err?.message ?? String(err));
  }
});

$('#btn-logout').addEventListener('click', () => {
  localStorage.removeItem(PAT_KEY);
  pat = '';
  location.reload();
});

$('#btn-retry').addEventListener('click', enterEditorFlow);

/* ---------------- 手动提交兜底 ---------------- */

$('#btn-copy-manual').addEventListener('click', async () => {
  let text = `1) 把以下 JSON 保存为仓库根目录 ${CONTENT_PATH}\n`;
  text += `2) 终端执行:\n`;
  text += `   cd <repo>\n   git add ${CONTENT_PATH} && git commit -m "chore(data): 题库编辑 (admin)" && git push origin ${BRANCH}\n\n`;
  text += `=== data/content.json 内容 ===\n`;
  try {
    // 尝试读取当前表单内容;失败则给默认题库
    const content = collectContent();
    text += JSON.stringify(content, null, 2);
  } catch {
    text += JSON.stringify({ version: '', easterEggs: EASTER_EGGS, questions: QUESTIONS }, null, 2);
  }
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制手动提交内容');
  } catch {
    showError('复制失败', '请手动全选错误信息中提供的命令。');
  }
});

/* ---------------- 状态 ---------------- */

function updateStatus(text) {
  $('#status-text').textContent = text;
}

/* ---------------- 启动 ---------------- */

if (pat) {
  enterEditorFlow();
} else {
  showView('login');
}
