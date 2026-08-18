import { PERSONALITIES } from './data.js';
import { loadContent, getQuestions } from './content.js';
import { scoreAnswers } from './scoring.js';
import { createUI } from './ui.js';
import { createSimulation } from './simulator.js';
import { unlockPersonality, track } from './storage.js';

const root = document.getElementById('app');
const ui = createUI(root);

let questions = getQuestions();
let answers = [];
let index = 0;
let currentTypeId = '';
let simulation = null;

function start() {
  answers = Array(questions.length).fill(null);
  index = 0;
  track('quiz_start');
  ui.showScreen('quiz');
  ui.renderQuestion(questions[index], index, questions.length);
}

function selectAnswer(key) {
  if (answers[index] !== null) return;
  answers[index] = key;
  const completed = index + 1;
  index += 1;

  if (index >= questions.length) {
    finish();
    return;
  }

  if ([4, 8, 12, 16].includes(completed)) {
    ui.showCheckpoint(completed, () => ui.renderQuestion(questions[index], index, questions.length));
  } else {
    ui.renderQuestion(questions[index], index, questions.length);
  }
}

function finish() {
  const result = scoreAnswers(answers);
  currentTypeId = result.typeId;
  unlockPersonality(currentTypeId);
  ui.renderResult(currentTypeId, result);
  ui.showScreen('result');
}

function startSimulator(replacement = 'native') {
  if (!currentTypeId) return;
  simulation = createSimulation(currentTypeId, replacement);
  track('simulator_start', currentTypeId);
  ui.showScreen('simulator');
  advanceSimulator();
}

function advanceSimulator() {
  if (!simulation) return;
  const event = simulation.next();
  if (event) ui.renderSimulationEvent(simulation.profile, event);
  else {
    const report = simulation.report();
    track('simulator_finish', report.grade);
    ui.renderSimulationReport(report);
  }
}

ui.on('start', start);
ui.on('restart', start);
ui.on('select-answer', (_, button) => selectAnswer(button.dataset.value));
ui.on('home', () => ui.showScreen('cover'));
ui.on('atlas', () => {
  ui.renderAtlas();
  ui.showScreen('atlas');
});
ui.on('preview-personality', (_, button) => {
  currentTypeId = button.dataset.value;
  ui.renderResult(currentTypeId);
  ui.showScreen('result');
});
ui.on('sim-setup', () => ui.renderSimulatorSetup(currentTypeId));
ui.on('run-sim', (_, button) => startSimulator(button.dataset.value || 'native'));
ui.on('sim-next', advanceSimulator);
ui.on('match', () => {
  ui.renderMatch();
  ui.showScreen('match');
});
ui.on('share', () => ui.shareResult(currentTypeId));
ui.on('copy', () => ui.copyResult(currentTypeId));

const previewId = new URLSearchParams(location.search).get('preview');
if (previewId && PERSONALITIES[previewId]) {
  currentTypeId = previewId;
  ui.renderResult(previewId);
  ui.showScreen('result');
} else {
  ui.showScreen('cover');
}

// 异步拉取线上题库:封面先渲染不等网络,加载完成后原子替换。
// 20 题槽位与 A-D key 不变,中途替换不影响计分与彩蛋判定。
loadContent().then((res) => {
  questions = getQuestions();
  if (res.source === 'remote') {
    console.info(`题库已加载: version=${res.version}`);
  }
});
