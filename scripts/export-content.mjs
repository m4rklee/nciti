/**
 * 从 js/data.js 导出线上题库 data/content.json
 * 用法:
 *   npm run export:content          # content.json 已存在则拒绝覆盖
 *   npm run export:content -- --force  # 强制用 data.js 重置线上题库
 *
 * 注意:data.js 是「出厂默认 + 回退 + 恢复默认按钮」的内容源,
 * content.json 是「线上数据源」。build 不会重新生成它,
 * 站长在线编辑的内容存于 content.json,勿被本脚本覆盖。
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUESTIONS } from '../js/data.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'data', 'content.json');
const force = process.argv.includes('--force');
const version = '0.1.0';

const content = { version, questions: QUESTIONS };

if (!force && existsSync(target)) {
  console.error(`✗ ${target} 已存在。`);
  console.error('  content.json 是线上数据源,可能包含站长在线编辑的内容,拒绝覆盖。');
  console.error('  确认要用 data.js 重置线上题库时执行: npm run export:content -- --force');
  process.exit(1);
}

mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(target, JSON.stringify(content, null, 2) + '\n', 'utf8');
console.log(`✓ 已导出 ${QUESTIONS.length} 题 → ${target} (version=${version})`);
