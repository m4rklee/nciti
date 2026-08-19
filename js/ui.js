import { PERSONALITIES, SCHOOL_LABELS } from './data.js';
import { mountAvatar } from './avatars.js?v=3';
import {
  DISCLAIMER,
  QUIZ_MODULES,
  RARITY,
  getProfile,
  matchProfiles,
} from './experience-data.js';
import { getCollection, track } from './storage.js';
import { metricLabel } from './simulator.js';

const SCREENS = ['cover', 'quiz', 'result', 'atlas', 'simulator', 'match'];

export function createUI(root) {
  root.innerHTML = `
    <div class="app-shell">
      <header class="site-header">
        <button class="brand" type="button" data-action="home" aria-label="返回首页">
          <span class="brand__mark">TI</span>
          <span>保命人格研究所</span>
        </button>
        <button class="header-link" type="button" data-action="atlas">人格图鉴</button>
      </header>

      <main>
        <section class="screen screen--cover" data-screen="cover">
          <div class="cover-orbit" aria-hidden="true">
            <span>🛡️</span><span>🍀</span><span>🤖</span>
            <div class="cover-orbit__core">TI</div>
          </div>
          <p class="eyebrow">趣味人格测试 · 娱乐向</p>
          <h1 class="title">你的生活<br><em>靠什么兜底？</em></h1>
          <p class="lead">20 道脑洞题，测出你的保命人格。<br>有人靠规划，有人靠朋友，还有人靠祖宗。</p>
          <div class="cover-stats">
            <span><b>32</b> 款人格</span>
            <span><b>2</b> 分钟</span>
            <span><b>∞</b> 种人生</span>
          </div>
          <button type="button" class="btn btn--primary btn--hero" data-action="start">开始测试 <span>→</span></button>
          <p class="microcopy">无需登录 · 不收集身份信息 · 可随时重测</p>
        </section>

        <section class="screen screen--quiz is-hidden" data-screen="quiz">
          <div class="quiz-topline">
            <div>
              <p class="module-eyebrow" data-el="module-eyebrow"></p>
              <h2 class="module-title" data-el="module-title"></h2>
            </div>
            <span class="module-emoji" data-el="module-emoji"></span>
          </div>
          <div class="progress">
            <div class="progress__bar" data-el="progress-bar"></div>
          </div>
          <div class="progress-row">
            <span data-el="progress-text">01 / 20</span>
            <span data-el="progress-pct">5%</span>
          </div>
          <p class="question-number" data-el="question-number"></p>
          <h2 class="question" data-el="question"></h2>
          <div class="options" data-el="options"></div>
        </section>

        <section class="screen screen--result is-hidden" data-screen="result">
          <div data-el="result-content"></div>
        </section>

        <section class="screen screen--atlas is-hidden" data-screen="atlas">
          <div data-el="atlas-content"></div>
        </section>

        <section class="screen screen--simulator is-hidden" data-screen="simulator">
          <div data-el="simulator-content"></div>
        </section>

        <section class="screen screen--match is-hidden" data-screen="match">
          <div data-el="match-content"></div>
        </section>
      </main>

      <div class="checkpoint is-hidden" data-el="checkpoint" role="dialog" aria-modal="true">
        <div class="checkpoint__card">
          <span class="checkpoint__icon" data-el="checkpoint-icon">✦</span>
          <p class="checkpoint__step" data-el="checkpoint-step"></p>
          <h2 data-el="checkpoint-text"></h2>
          <button class="btn btn--primary" type="button" data-el="checkpoint-next">继续下一局 →</button>
        </div>
      </div>

      <div class="toast is-hidden" data-el="toast" role="status"></div>
    </div>
  `;

  const $ = (selector) => root.querySelector(selector);
  const els = {
    screens: Object.fromEntries(SCREENS.map((name) => [name, $("[data-screen='" + name + "']")])),
    progressBar: $('[data-el="progress-bar"]'),
    progressText: $('[data-el="progress-text"]'),
    progressPct: $('[data-el="progress-pct"]'),
    moduleEyebrow: $('[data-el="module-eyebrow"]'),
    moduleTitle: $('[data-el="module-title"]'),
    moduleEmoji: $('[data-el="module-emoji"]'),
    questionNumber: $('[data-el="question-number"]'),
    question: $('[data-el="question"]'),
    options: $('[data-el="options"]'),
    resultContent: $('[data-el="result-content"]'),
    atlasContent: $('[data-el="atlas-content"]'),
    simulatorContent: $('[data-el="simulator-content"]'),
    matchContent: $('[data-el="match-content"]'),
    checkpoint: $('[data-el="checkpoint"]'),
    checkpointIcon: $('[data-el="checkpoint-icon"]'),
    checkpointStep: $('[data-el="checkpoint-step"]'),
    checkpointText: $('[data-el="checkpoint-text"]'),
    checkpointNext: $('[data-el="checkpoint-next"]'),
    toast: $('[data-el="toast"]'),
  };

  const handlers = new Map();
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || !root.contains(button)) return;
    const fn = handlers.get(button.dataset.action);
    if (fn) fn(event, button);
  });

  function on(action, handler) {
    handlers.set(action, handler);
  }

  function showScreen(name) {
    for (const [key, node] of Object.entries(els.screens)) {
      node.classList.toggle('is-hidden', key !== name);
    }
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion(q, index, total) {
    const module = QUIZ_MODULES.find((item) => index >= item.start && index <= item.end);
    const pct = Math.round(((index + 1) / total) * 100);
    els.moduleEyebrow.textContent = module.eyebrow;
    els.moduleTitle.textContent = module.title;
    els.moduleEmoji.textContent = module.emoji;
    els.progressBar.style.width = `${pct}%`;
    els.progressText.textContent = `${String(index + 1).padStart(2, '0')} / ${total}`;
    els.progressPct.textContent = `${pct}%`;
    els.questionNumber.textContent = `QUESTION ${String(index + 1).padStart(2, '0')}`;
    els.question.textContent = q.text;
    els.options.innerHTML = '';
    let locked = false;

    for (const opt of q.options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.dataset.action = 'select-answer';
      btn.dataset.value = opt.key;
      btn.innerHTML = `<span class="option__key">${opt.key}</span><span class="option__text">${opt.text}</span><span class="option__arrow">↗</span>`;
      btn.addEventListener('click', (event) => {
        if (locked) {
          event.stopImmediatePropagation();
          return;
        }
        locked = true;
        btn.classList.add('is-selected');
        els.options.querySelectorAll('button').forEach((node) => { node.disabled = true; });
      }, { capture: true });
      els.options.appendChild(btn);
    }
  }

  function showCheckpoint(completed, next) {
    const module = QUIZ_MODULES.find((item) => item.end === completed - 1);
    els.checkpointIcon.textContent = module.emoji;
    els.checkpointStep.textContent = `${completed} / 20 · 阶段观察`;
    els.checkpointText.textContent = module.checkpoint;
    els.checkpoint.classList.remove('is-hidden');
    els.checkpointNext.onclick = () => {
      els.checkpoint.classList.add('is-hidden');
      next();
    };
  }

  function renderResult(typeId, scoring = null) {
    const p = getProfile(typeId);
    const avatar = document.createElement('div');
    avatar.className = 'result-avatar';
    mountAvatar(avatar, typeId);

    els.resultContent.innerHTML = `
      <article class="result-hero" data-school="${p.school}" data-kind="${p.rarityKey}">
        <div class="result-kicker"><span>${p.rarity.icon}</span> ${p.rarity.label}</div>
        <p class="result-overline">你的保命人格是</p>
        <h1><span>${p.zh}</span><b>${p.en}</b></h1>
        <div class="result-avatar-slot" data-el="result-avatar-slot"></div>
        <p class="result-quote">「${p.quote}」</p>
        <div class="tag-row">${p.socialTags.map((tag) => `<span># ${tag}</span>`).join('')}</div>
      </article>

      <section class="report-section">
        <div class="section-heading"><span>01</span><div><p>PERSONALITY NOTES</p><h2>你的兜底人格说明书</h2></div></div>
        <div class="insight-grid">
          ${insightCard('☀️', '你的日常', p.daily)}
          ${insightCard('🔎', '潜在短板', p.shortcoming)}
          ${insightCard('🌱', '温和科普', p.science)}
        </div>
      </section>

      <section class="report-section buff-panel">
        <div class="section-heading"><span>02</span><div><p>RECOMMENDED BUFFS</p><h2>推荐 Buff</h2></div></div>
        <div class="recommended-buffs">
          ${recommendedBuffCards(p.recommendedBuffs)}
        </div>
      </section>

      <section class="sim-cta">
        <p>03 · LIFE SIMULATOR</p>
        <h2>如果带着这套 Buff<br>过完一生，会怎样？</h2>
        <span>模拟大病、失业、家庭与养老事件，生成你的完整人生报告。</span>
        <a class="btn btn--light" style="display:block" href="https://ncilife-ltc1z0hq.maozi.io/life-demo-v2.html" target="_blank" rel="noopener">进入 3 分钟人生模拟器 →</a>
      </section>

      <section class="action-panel">
        <button class="btn btn--primary" type="button" data-action="share">分享人格结果</button>
        <button class="btn btn--secondary" type="button" data-action="copy">复制朋友圈文案</button>
        <button class="text-action" type="button" data-action="match">测测双人兜底适配度</button>
        <button class="text-action" type="button" data-action="restart">再测一次</button>
      </section>
      ${scoring ? `<p class="result-path">本次判定：${pathLabel(scoring.path)}</p>` : ''}
      <p class="disclaimer">${DISCLAIMER}</p>
    `;
    els.resultContent.querySelector('[data-el="result-avatar-slot"]').appendChild(avatar);
  }

  function renderAtlas() {
    const unlocked = new Set(getCollection());
    const ids = Object.keys(PERSONALITIES);
    els.atlasContent.innerHTML = `
      <div class="page-intro">
        <p class="eyebrow">PERSONALITY ATLAS</p>
        <h1>保命人格图鉴</h1>
        <p>已解锁 <b>${unlocked.size}</b> / ${ids.length}。每次真实测试结果都会留在这台设备上。</p>
      </div>
      <div class="atlas-progress"><i style="width:${Math.round(unlocked.size / ids.length * 100)}%"></i></div>
      <div class="filter-legend">${Object.values(RARITY).map((r) => `<span>${r.icon} ${r.label}</span>`).join('')}</div>
      <div class="atlas-grid">
        ${ids.map((id) => atlasCard(id, unlocked.has(id))).join('')}
      </div>
      <div class="page-actions"><button class="btn btn--primary" data-action="start">继续解锁人格</button><button class="btn btn--secondary" data-action="home">返回首页</button></div>
    `;
  }

  function renderSimulatorSetup(typeId) {
    const p = getProfile(typeId);
    showScreen('simulator');
    els.simulatorContent.innerHTML = `
      <div class="page-intro">
        <p class="eyebrow">LIFE SIMULATOR · 6 EVENTS</p>
        <h1>${p.zh}的人生开局</h1>
        <p>系统已带入你的人格推荐 Buff。你可以额外强化一个方向，也可以坚持原生开局。</p>
      </div>
      <div class="locked-profile">
        <div class="locked-profile__emoji">${p.emoji}</div>
        <div><small>已锁定人格</small><h2>${p.en} · ${p.zh}</h2><p>推荐：${p.recommendedBuffs.join('、')}</p></div>
      </div>
      <p class="choice-label">选择唯一一次额外强化</p>
      <div class="sim-choices">
        ${simChoice('native', '🧬', '原生开局', '完全保留人格本色')}
        ${simChoice('cash', '💰', '现金流 +8', '缓冲失业与大额支出')}
        ${simChoice('health', '❤️', '健康值 +8', '缓冲医疗健康事件')}
        ${simChoice('family', '🏠', '家庭支援 +8', '缓冲照护责任')}
        ${simChoice('retire', '🌅', '养老蓄能 +8', '扩大晚年选择空间')}
      </div>
      <p class="disclaimer">${DISCLAIMER}</p>
    `;
  }

  function renderSimulationEvent(profile, event) {
    els.simulatorContent.innerHTML = `
      <div class="sim-progress"><i style="width:${event.step / event.total * 100}%"></i></div>
      <p class="sim-step">人生事件 ${event.step} / ${event.total}</p>
      <article class="event-card ${event.protected ? 'is-protected' : ''}">
        <div class="event-age">${event.age}<small>岁</small></div>
        <div class="event-icon">${event.icon}</div>
        <p>${event.title}</p>
        <h1>${event.text}</h1>
        <div class="event-outcome">${event.protected ? '护盾生效 · ' : ''}${event.outcome}</div>
      </article>
      ${metricBars(event.state)}
      <button class="btn btn--primary" type="button" data-action="sim-next">${event.step === event.total ? '生成完整人生报告' : '继续前进'} →</button>
    `;
  }

  function renderSimulationReport(report) {
    const gradeEmoji = report.grade === '安稳人生' ? '🌤️' : report.grade === '普通人生' ? '🌿' : '🌧️';
    els.simulatorContent.innerHTML = `
      <article class="life-report">
        <p class="eyebrow">YOUR LIFE REPORT</p>
        <div class="life-grade-icon">${gradeEmoji}</div>
        <h1>${report.grade}</h1>
        <p>人生稳定度 <b>${report.average}</b> / 100</p>
        ${metricBars(report.state)}
      </article>
      <section class="report-section">
        <div class="section-heading"><span>!</span><div><p>GENTLE NOTE</p><h2>这次人生给你的提示</h2></div></div>
        <p class="report-advice">${report.advice}</p>
      </section>
      <div class="action-panel">
        <button class="btn btn--primary" data-action="share">分享我的人生报告</button>
        <button class="btn btn--secondary" data-action="sim-setup">换一个 Buff 重开</button>
        <button class="text-action" data-action="atlas">查看人格图鉴</button>
      </div>
      <p class="disclaimer">${DISCLAIMER}</p>
    `;
  }

  function renderMatch() {
    const options = Object.keys(PERSONALITIES).map((id) => {
      const p = getProfile(id);
      return `<option value="${id}">${p.en} · ${p.zh}</option>`;
    }).join('');
    els.matchContent.innerHTML = `
      <div class="page-intro">
        <p class="eyebrow">DUO MATCH</p>
        <h1>双人兜底适配</h1>
        <p>适合情侣、好友和家人。看看两种风险观放在一起，会产生怎样的化学反应。</p>
      </div>
      <div class="match-form">
        <label>我的人格<select data-el="match-a">${options}</select></label>
        <span>×</span>
        <label>TA 的人格<select data-el="match-b">${options}</select></label>
        <button class="btn btn--primary" type="button" data-el="match-run">生成适配报告</button>
      </div>
      <div data-el="match-result"></div>
      <div class="page-actions"><button class="btn btn--secondary" data-action="home">返回首页</button></div>
      <p class="disclaimer">${DISCLAIMER}</p>
    `;
    const a = els.matchContent.querySelector('[data-el="match-a"]');
    const b = els.matchContent.querySelector('[data-el="match-b"]');
    b.selectedIndex = Math.min(3, b.options.length - 1);
    els.matchContent.querySelector('[data-el="match-run"]').onclick = () => {
      const result = matchProfiles(a.value, b.value);
      track('match', `${a.value}+${b.value}`);
      els.matchContent.querySelector('[data-el="match-result"]').innerHTML = `
        <article class="match-report">
          <p>适配度</p><strong>${result.score}<small>%</small></strong>
          <h2>${result.title}</h2>
          <div class="match-pair"><span>${result.a.emoji} ${result.a.en}</span><i>+</i><span>${result.b.emoji} ${result.b.en}</span></div>
          <p>${result.text}</p>
        </article>
      `;
    };
  }

  async function shareResult(typeId) {
    const p = getProfile(typeId);
    const text = `测完保命 TI，我是 ${p.en} ${p.zh}：${p.shareLine} 你的人生靠什么兜底？`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '保命 TI · 人生兜底人格测试', text, url: location.href.split('?')[0] });
        track('share', typeId);
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    await copyText(text);
    toast('分享文案已复制');
  }

  async function copyResult(typeId) {
    const p = getProfile(typeId);
    await copyText(`${p.emoji} 我的保命人格是 ${p.en} · ${p.zh}！${p.shareLine} #保命TI #人生兜底人格`);
    track('copy', typeId);
    toast('朋友圈文案已复制');
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove('is-hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => els.toast.classList.add('is-hidden'), 1800);
  }

  return {
    on, showScreen, renderQuestion, showCheckpoint, renderResult, renderAtlas,
    renderSimulatorSetup, renderSimulationEvent, renderSimulationReport,
    renderMatch, shareResult, copyResult,
  };
}

function insightCard(icon, title, text) {
  return `<article class="insight-card"><span>${icon}</span><div><h3>${title}</h3><p>${text}</p></div></article>`;
}

function recommendedBuffCards(items) {
  return items.map((item) => {
    let icon = '✨';
    if (item.includes('重疾')) icon = '🛡️';
    else if (item.includes('意外')) icon = '⚡';
    else if (item.includes('医疗')) icon = '❤️';
    else if (item.includes('养老')) icon = '🌙';
    else if (item.includes('父母')) icon = '🏠';
    return `<article class="recommended-buff"><span>${icon}</span><b>${item}</b></article>`;
  }).join('');
}

function atlasCard(typeId, unlocked) {
  const p = getProfile(typeId);
  if (!unlocked) {
    return `<article class="atlas-card is-locked"><span>?</span><h3>尚未解锁</h3><p>${p.rarity.icon} ${p.rarity.label}</p></article>`;
  }
  return `<button class="atlas-card" type="button" data-action="preview-personality" data-value="${typeId}">
    <span>${p.emoji}</span><h3>${p.en}</h3><p>${p.zh}</p><small>${p.rarity.icon} ${p.rarity.label}</small>
  </button>`;
}

function simChoice(value, icon, title, text) {
  return `<button class="sim-choice" type="button" data-action="run-sim" data-value="${value}"><span>${icon}</span><div><b>${title}</b><small>${text}</small></div><i>→</i></button>`;
}

function metricBars(state) {
  return `<div class="metric-list">${Object.entries(state).map(([key, value]) => `
    <div class="metric"><div><span>${metricLabel(key)}</span><b>${value}</b></div><i><em style="width:${value}%"></em></i></div>
  `).join('')}</div>`;
}

function pathLabel(path) {
  return { core: '核心人格', easter: '稀有彩蛋', hidden: '限定隐藏', fallback: '百搭兜底' }[path] || path;
}
