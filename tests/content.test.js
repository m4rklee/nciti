/**
 * 在线题库校验 validateContent 单测
 * 运行: node --test tests/
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateContent } from '../js/content.js';
import { QUESTIONS, PERSONALITIES, EASTER_EGGS } from '../js/data.js';

const ALLOWED_TAGS = Object.keys(PERSONALITIES);

/** 从默认题库深拷贝出合法 fixture */
function fixture() {
  return {
    version: '0.1.0',
    easterEggs: JSON.parse(JSON.stringify(EASTER_EGGS)),
    questions: JSON.parse(JSON.stringify(QUESTIONS)),
  };
}

function ok(content) {
  const r = validateContent(content, ALLOWED_TAGS);
  assert.equal(r.ok, true, `应通过: ${JSON.stringify(r.errors ?? '')}`);
  return r;
}

function fail(content, label) {
  const r = validateContent(content, ALLOWED_TAGS);
  assert.equal(r.ok, false, `${label} 应被拒绝`);
  assert.ok(Array.isArray(r.errors) && r.errors.length > 0, `${label} 应返回错误列表`);
  return r;
}

describe('validateContent', () => {
  it('默认题库(20题×4选项)通过', () => {
    ok(fixture());
  });

  it('19 题拒绝', () => {
    const c = fixture();
    c.questions.pop();
    const r = fail(c, '19 题');
    assert.equal(r.errors[0].field, 'questions');
  });

  it('21 题拒绝', () => {
    const c = fixture();
    c.questions.push(JSON.parse(JSON.stringify(c.questions[0])));
    const r = fail(c, '21 题');
    assert.equal(r.errors[0].field, 'questions');
  });

  it('id 重复拒绝', () => {
    const c = fixture();
    c.questions[1].id = c.questions[0].id;
    const r = fail(c, 'id 重复');
    assert.ok(r.errors.some((e) => e.field === 'id'));
  });

  it('section 为空拒绝', () => {
    const c = fixture();
    c.questions[3].section = '  ';
    const r = fail(c, '空 section');
    assert.equal(r.errors[0].q, 3);
    assert.equal(r.errors[0].field, 'section');
  });

  it('题干为空拒绝', () => {
    const c = fixture();
    c.questions[5].text = '';
    const r = fail(c, '空题干');
    assert.equal(r.errors[0].q, 5);
    assert.equal(r.errors[0].field, 'text');
  });

  it('选项 3 个拒绝', () => {
    const c = fixture();
    c.questions[2].options.pop();
    const r = fail(c, '3 选项');
    assert.ok(r.errors.some((e) => e.q === 2 && e.field === 'options'));
  });

  it('选项 5 个拒绝', () => {
    const c = fixture();
    c.questions[2].options.push({ key: 'E', text: '多出来的', tag: 'LESER' });
    const r = fail(c, '5 选项');
    assert.ok(r.errors.some((e) => e.q === 2 && e.field === 'options'));
  });

  it('选项 key 重复拒绝', () => {
    const c = fixture();
    c.questions[1].options[1].key = 'A';
    const r = fail(c, 'key 重复');
    assert.ok(r.errors.some((e) => e.q === 1 && e.field === 'options[1].key'));
  });

  it('选项 key 为 E 拒绝', () => {
    const c = fixture();
    c.questions[1].options[3].key = 'E';
    const r = fail(c, 'key=E');
    assert.ok(r.errors.some((e) => e.q === 1 && e.field === 'options[3].key'));
  });

  it('选项文案为空拒绝', () => {
    const c = fixture();
    c.questions[4].options[2].text = '';
    const r = fail(c, '空选项文案');
    assert.ok(r.errors.some((e) => e.q === 4 && e.field === 'options[2].text'));
  });

  it('tag 不在人格表内拒绝', () => {
    const c = fixture();
    c.questions[6].options[0].tag = 'NOT_A_PERSONALITY';
    const r = fail(c, '非法 tag');
    assert.ok(r.errors.some((e) => e.q === 6 && e.field === 'options[0].tag'));
  });

  it('缺 questions 数组拒绝', () => {
    const r = fail({ version: '0.1.0' }, '缺 questions');
    assert.equal(r.errors[0].field, 'questions');
  });

  it('非对象输入拒绝', () => {
    for (const bad of [null, 'text', 42, [1, 2]]) {
      assert.equal(validateContent(bad, ALLOWED_TAGS).ok, false, `应拒绝 ${JSON.stringify(bad)}`);
    }
  });

  it('version 非字符串拒绝(其余合法)', () => {
    const c = fixture();
    c.version = 0.1;
    const r = fail(c, '非法 version');
    assert.equal(r.errors[0].field, 'version');
  });

  it('默认题库包含的 tag 全部合法(回归保护)', () => {
    const allTags = new Set();
    for (const q of QUESTIONS) for (const opt of q.options) allTags.add(opt.tag);
    for (const t of allTags) assert.ok(ALLOWED_TAGS.includes(t), `tag ${t} 应在人格表内`);
  });
});

describe('validateContent · easterEggs', () => {
  it('缺省 easterEggs 视为合法(回退内置彩蛋表)', () => {
    const c = fixture();
    delete c.easterEggs;
    const r = validateContent(c, ALLOWED_TAGS);
    assert.equal(r.ok, true);
    assert.equal(r.easterEggs, EASTER_EGGS, '缺省时返回内置彩蛋表');
  });

  it('合法 easterEggs 通过', () => {
    const r = ok(fixture());
    assert.equal(Object.keys(r.easterEggs).length, Object.keys(EASTER_EGGS).length);
  });

  it('彩蛋 key 是核心人格(非 easter 类)拒绝', () => {
    const c = fixture();
    c.easterEggs.LESER = { q: 0, opt: 'A' };
    const r = fail(c, '核心人格彩蛋');
    assert.ok(r.errors.some((e) => e.q === 'LESER' && e.field === 'easterEggs'));
  });

  it('彩蛋 key 不在人格表内拒绝', () => {
    const c = fixture();
    c.easterEggs.GHOST = { q: 0, opt: 'A' };
    const r = fail(c, '未知人格彩蛋');
    assert.ok(r.errors.some((e) => e.q === 'GHOST'));
  });

  it('题号越界(q=20)拒绝', () => {
    const c = fixture();
    c.easterEggs.LAZY.q = 20;
    const r = fail(c, 'q=20');
    assert.ok(r.errors.some((e) => e.q === 'LAZY'));
  });

  it('题号非整数(q=1.5)拒绝', () => {
    const c = fixture();
    c.easterEggs.LAZY.q = 1.5;
    fail(c, 'q=1.5');
  });

  it('选项非 A-D(opt=E)拒绝', () => {
    const c = fixture();
    c.easterEggs.LAZY.opt = 'E';
    const r = fail(c, 'opt=E');
    assert.ok(r.errors.some((e) => e.q === 'LAZY'));
  });

  it('两个彩蛋共用同一触发位拒绝', () => {
    const c = fixture();
    c.easterEggs.NAKED = { q: c.easterEggs.LAZY.q, opt: c.easterEggs.LAZY.opt };
    const r = fail(c, '触发位重复');
    assert.ok(r.errors.some((e) => e.q === 'NAKED' && e.message.includes('共用')));
  });

  it('easterEggs 不是对象(数组/null)拒绝', () => {
    for (const bad of [[], null]) {
      const c = fixture();
      c.easterEggs = bad;
      assert.equal(validateContent(c, ALLOWED_TAGS).ok, false, `应拒绝 ${JSON.stringify(bad)}`);
    }
  });

  it('出厂 EASTER_EGGS 全部合法(回归保护)', () => {
    const r = validateContent(fixture(), ALLOWED_TAGS);
    assert.equal(r.ok, true);
  });
});
