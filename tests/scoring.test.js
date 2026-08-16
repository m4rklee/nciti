/**
 * 保命TI计分关键路径测试
 * 运行: node --test tests/scoring.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnswers, pickResult, computeSchoolTotals, tallyScores } from '../js/scoring.js';
import { SCHOOLS } from '../js/data.js';

const CORE_IDS = [
  'LESER', 'YOLO', 'EMMM', 'COVERED', 'HOARDER', 'PLANNER',
  'TECHIE', 'COHO', 'DINK', 'LUCKY',
];

describe('scoreAnswers', () => {
  it('裸奔流派拉满且制度为零 → VOID', () => {
    const answers = [
      'A', // LESER
      'D', // NAKED
      'A', // LESER
      'B', // LESER
      'C', // YOLO
      'C', // EMMM
      'C', // EMMM
      'C', // YOLO
      'B', // YOLO
      'C', // LESER
      'B', // EMMM
      'A', // KARMA
      'C', // LESER
      'B', // LESER
      'C', // LESER
      'B', // LESER
      'D', // EMMM
      'B', // DINK
      'B', // LESER
      'B', // TECHIE
    ];
    const r = scoreAnswers(answers);
    assert.equal(r.schoolTotals[SCHOOLS.SYSTEM], 0);
    assert.ok(r.schoolTotals[SCHOOLS.BARE] >= 8, `bare=${r.schoolTotals[SCHOOLS.BARE]}`);
    assert.equal(r.typeId, 'VOID');
    assert.equal(r.path, 'hidden');
  });

  it('制度流派拉满且裸奔为零 → MAXED', () => {
    // Q3-C 为 CHILL 彩蛋（制度派），仍计入制度流派
    const answers = [
      'B', // HOARDER
      'A', // PLANNER
      'C', // CHILL（制度彩蛋）
      'A', // PLANNER
      'A', // HOARDER
      'A', // COVERED
      'A', // PLANNER
      'A', // HOARDER
      'A', // COVERED
      'B', // LUCKY（玄学，非裸奔）
      'A', // COVERED
      'A', // KARMA
      'A', // PLANNER
      'A', // HOARDER
      'A', // PLANNER
      'A', // PLANNER
      'A', // COVERED
      'A', // HOARDER
      'A', // COVERED
      'A', // PLANNER
    ];
    const r = scoreAnswers(answers);
    assert.equal(r.schoolTotals[SCHOOLS.BARE], 0);
    assert.ok(r.schoolTotals[SCHOOLS.SYSTEM] >= 8, `system=${r.schoolTotals[SCHOOLS.SYSTEM]}`);
    assert.equal(r.typeId, 'MAXED');
    assert.equal(r.path, 'hidden');
  });

  it('命中 Q12-C 且核心最高分为 2 → ASTRAL 彩蛋', () => {
    const scores = { ASTRAL: 1, PLANNER: 2, LUCKY: 1 };
    const answers = Array(20).fill('A');
    answers[11] = 'C';
    const schoolTotals = computeSchoolTotals(scores);
    const r = pickResult(scores, answers, schoolTotals, () => 0);
    assert.equal(r.typeId, 'ASTRAL');
    assert.equal(r.path, 'easter');
  });

  it('TECHIE 两分形成唯一偏向时可以成为核心结果', () => {
    const scores = { TECHIE: 2, PLANNER: 1, ASTRAL: 1 };
    const answers = Array(20).fill('A');
    answers[11] = 'C';
    const r = pickResult(scores, answers, computeSchoolTotals(scores), () => 0);
    assert.equal(r.typeId, 'TECHIE');
    assert.equal(r.path, 'core');
  });

  it('多题偏向 COVERED → COVERED 核心', () => {
    const answers = [
      'C', // YOLO
      'D', // NAKED（避免 MAXED）
      'A', // LESER
      'C', // COVERED
      'B', // COVERED
      'A', // COVERED
      'B', // COVERED
      'C', // YOLO
      'A', // COVERED
      'C', // LESER
      'A', // COVERED
      'A', // KARMA
      'C', // LESER
      'B', // LESER
      'C', // LESER
      'C', // COVERED
      'A', // COVERED
      'B', // DINK
      'A', // COVERED
      'D', // DINK
    ];
    const r = scoreAnswers(answers);
    assert.equal(r.typeId, 'COVERED');
    assert.equal(r.path, 'core');
    assert.ok((r.scores.COVERED || 0) >= 3);
  });

  it('核心均 ≤1 且无彩蛋命中 → HHHH', () => {
    // 完整题库 Q12 全是彩蛋，真实作答几乎必中彩蛋；
    // 用 pickResult + 不匹配彩蛋的 answers 验证兜底分支。
    const scores = {
      LESER: 1,
      YOLO: 1,
      PLANNER: 1,
      TECHIE: 1,
      DINK: 1,
    };
    const fakeAnswers = Array(20).fill('A');
    fakeAnswers[11] = 'Z';
    const schoolTotals = computeSchoolTotals(scores);
    const r = pickResult(scores, fakeAnswers, schoolTotals, () => 0);
    assert.equal(r.typeId, 'HHHH');
    assert.equal(r.path, 'fallback');
  });

  it('两核心同分时按流派总分破平局', () => {
    const scores = {
      LESER: 4,
      COVERED: 4,
      YOLO: 3,
    };
    const answers = Array(20).fill('A');
    const schoolTotals = {
      [SCHOOLS.BARE]: 7,
      [SCHOOLS.SYSTEM]: 4,
      [SCHOOLS.FANTASY]: 0,
      [SCHOOLS.MYSTIC]: 0,
    };
    const r = pickResult(scores, answers, schoolTotals, () => 0);
    assert.equal(r.typeId, 'LESER');
    assert.equal(r.path, 'core');
  });
});
