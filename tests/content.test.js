/**
 * 在线题库校验 validateContent 单测
 * 运行: node --test tests/
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateContent } from '../js/content.js';
import { QUESTIONS, PERSONALITIES } from '../js/data.js';

const ALLOWED_TAGS = Object.keys(PERSONALITIES);

/** 从默认题库深拷贝出合法 fixture */
function fixture() {
  return {
    version: '0.1.0',
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
