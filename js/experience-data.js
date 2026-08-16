import { PERSONALITIES, SCHOOLS } from './data.js';

export const QUIZ_MODULES = [
  { start: 0, end: 3, title: '续命日常局', eyebrow: '身体习惯', emoji: '🥤', checkpoint: '养生党和熬夜选手已经两极分化！' },
  { start: 4, end: 7, title: '保单真心话', eyebrow: '保障观念', emoji: '🛡️', checkpoint: '孝顺规划党 vs 拖延摆烂党诞生！' },
  { start: 8, end: 11, title: '风险破防实录', eyebrow: '心态 & 玄学', emoji: '🧙', checkpoint: '玄学选手集合，看看谁的护体 Buff 最离谱！' },
  { start: 12, end: 15, title: '工资生存账本', eyebrow: '储蓄消费', emoji: '💸', checkpoint: '月光族和储蓄党的账本差距拉开了！' },
  { start: 16, end: 19, title: '晚年兜底脑洞', eyebrow: '长期规划', emoji: '🤖', checkpoint: '' },
];

export const RARITY = {
  core: { label: '普通人格', icon: '●' },
  easter: { label: '稀有彩蛋', icon: '✦' },
  hidden: { label: '限定隐藏', icon: '◆' },
  fallback: { label: '百搭兜底', icon: '∞' },
};

export const SCHOOL_COPY = {
  [SCHOOLS.BARE]: {
    slogan: '风险看得透，行动全靠拖',
    daily: '你很会在当下寻找快乐，也知道风险存在，只是行动总被下一杯奶茶和下一个明天截胡。',
    shortcoming: '应急资金与基础保障容易留白，突发支出出现时，现金流可能一下变得很紧。',
    science: '可以先从应急储备和基础社会保障状态开始检查，一次只补一个最明显的缺口。',
  },
  [SCHOOLS.SYSTEM]: {
    slogan: '提前铺好人生安全垫，快乐底气两手抓',
    daily: '你习惯把风险拆成清单，用储蓄、保障和长期计划换取稳定感，做事相当有章法。',
    shortcoming: '自己的基础项通常较完整，容易忽略父母照护、长期护理等更远期的问题。',
    science: '定期复盘家庭成员、现金流和长期照护安排即可，不需要为了“更全”而重复配置。',
  },
  [SCHOOLS.FANTASY]: {
    slogan: '不靠保单靠脑洞，总有兜底新出路',
    daily: '你对未来很有想象力，相信科技、伙伴或生活方式可以重写传统养老剧本。',
    shortcoming: '愿景很美，但如果缺少可执行的资金和照护安排，外部依靠未必能在需要时及时出现。',
    science: '把愿景拆成储蓄目标、居住方案和照护联系人，会让理想中的晚年更接近现实。',
  },
  [SCHOOLS.MYSTIC]: {
    slogan: '科学风险放一边，玄学护体万事安',
    daily: '你相信运气、直觉和好心态，面对不确定性时总能找到自己的精神护盾。',
    shortcoming: '精神安定很重要，但好运无法稳定覆盖医疗、失业和养老带来的实际资金需求。',
    science: '保留你的好心态，同时准备一笔应急金并确认基础保障，是玄学与现实最和平的相处方式。',
  },
  [SCHOOLS.FALLBACK]: {
    slogan: '没有固定套路，也是一种人生套路',
    daily: '你的选择不被单一流派定义，面对生活更像随机应变型选手。',
    shortcoming: '灵活的另一面是容易缺少持续计划，真正需要资源时才临时整理。',
    science: '先盘点存款、社保和家庭支持三项，再决定下一步，不必一次解决所有问题。',
  },
};

const CORE_DETAILS = {
  LESER: {
    emoji: '🍗', socialTags: ['月光享乐党', '裸奔快乐人'],
    shareLine: '奶茶炸鸡天天炫，风险规划全随缘。',
  },
  YOLO: {
    emoji: '🛹', socialTags: ['又怕死又摆烂', '熬夜选手'],
    shareLine: '刷到风险瞬间心慌，转头继续熬夜。',
  },
  EMMM: {
    emoji: '🤔', socialTags: ['选择困难重症', '研究狂魔'],
    shareLine: '收藏百篇攻略，至今仍在加入对比。',
  },
  COVERED: {
    emoji: '🛡️', socialTags: ['一边作死一边保命', '炸鸡配保障'],
    shareLine: '快乐照常吃，安全垫也提前铺好。',
  },
  HOARDER: {
    emoji: '📚', socialTags: ['保单比快递多', '体检狂魔'],
    shareLine: '报告厚厚一沓，人生清单全部配齐。',
  },
  PLANNER: {
    emoji: '📊', socialTags: ['人生 Excel 操盘手', '极致稳党'],
    shareLine: '收支、风险、养老，全部写进人生表格。',
  },
  TECHIE: {
    emoji: '🤖', socialTags: ['未来科技信徒', '机器人养老党'],
    shareLine: '坐等智能机器人接管我的晚年生活。',
  },
  COHO: {
    emoji: '🫂', socialTags: ['好友互助养老', '单身搭子党'],
    shareLine: '好友在手，晚年组团生活不愁。',
  },
  DINK: {
    emoji: '🏝️', socialTags: ['不养娃富养自己', '旅居养老预定'],
    shareLine: '把育儿预算留给自己的晚年自由。',
  },
  LUCKY: {
    emoji: '🍀', socialTags: ['我命硬', '幸运 Buff 持有者'],
    shareLine: '自带幸运结界，风险见我自动绕行。',
  },
  HHHH: {
    emoji: '😆', socialTags: ['万事一笑而过', '无固定偏向'],
    shareLine: '天大的事先笑一下，系统随机给我兜底。',
  },
};

const EGG_LINES = {
  NAKED: '常年不体检，自认身体无敌', DENY: '意外疾病永远不会找上我',
  STUB: '行动永远等下一个黄道吉日', LAZY: '规划页面打开瞬间犯困',
  BLINDER: '看不见风险，风险就不存在', FATAL: '生死有命，出事坦然接受',
  DDL: '事情发生之后才开始研究', NOPE: '拒绝一切相关劝说',
  WORRY: '安全垫齐全，依旧夜夜焦虑', CHILL: '规划配齐，快乐优先',
  SMART: '可以了解，但绝不盲目入手', MONK: '不信复杂方案，只信余额',
  LEGACY: '全家接力养老，暂不自我规划', PET: '毛孩子陪伴我的整个晚年',
  STASH: '存款充足，保障规划仍空白', KARMA: '多行善举，自有命运兜底',
  FENG: '转运饰品就是我的风险护盾', ASTRAL: '星座运势护体，水逆除外',
  ANCE: '祖上积德，自有先人庇护',
};

const RECOMMENDED_BUFFS = {
  LESER: ['重疾护盾', '意外闪避', '养老蓄能'],
  YOLO: ['意外闪避', '养老蓄能'],
  EMMM: ['重疾护盾', '养老蓄能'],
  COVERED: ['重疾护盾', '医疗回血', '养老蓄能'],
  HOARDER: ['养老蓄能', '父母守护'],
  PLANNER: ['养老蓄能', '父母守护'],
  TECHIE: ['医疗回血', '养老蓄能'],
  COHO: ['医疗回血', '父母守护'],
  DINK: ['意外闪避', '养老蓄能'],
  LUCKY: ['意外闪避', '养老蓄能'],
  HHHH: ['Buff？听天由命吧哈哈哈哈哈哈！'],
  MAXED: ['父母守护', '养老蓄能'],
  VOID: ['重疾护盾', '意外闪避'],
};

function normalizeRecommendedBuffs(text) {
  const clean = String(text || '').split('（')[0].split('——')[0].trim();
  return clean.split(/[+、]/).map((item) => item.trim()).filter(Boolean);
}

const HIDDEN_DETAILS = {
  MAXED: {
    emoji: '👑', socialTags: ['风险对冲天花板', '全维规划'],
    shareLine: '人生安全垫直接拉满，安稳但不内耗。',
    daily: '你已经把保险、储蓄、家庭责任和养老计划落到了行动上，稳定感来自清楚而不是焦虑。',
    shortcoming: '基础项很完整，接下来更值得关注父母医疗、长期照护以及计划随人生阶段变化的问题。',
    science: '保持年度复盘即可。新增安排前先检查是否重复，适度留白也属于健康规划。',
  },
  VOID: {
    emoji: '🕳️', socialTags: ['全服极致裸奔', '运气硬扛'],
    shareLine: '风险缓冲几乎为零，但嘴上依然相当平静。',
    daily: '你把“以后再说”贯彻得很彻底，面对风险主要依靠身体、运气和临场发挥。',
    shortcoming: '现金缓冲较少时，大病、意外或失业容易让日常生活突然进入借贷周转状态。',
    science: '先确认社保连续状态并建立小额应急金，就能得到第一层现实缓冲，不必一步到位。',
  },
};

export function getProfile(typeId) {
  const base = PERSONALITIES[typeId];
  if (!base) throw new Error(`未知人格: ${typeId}`);
  const school = SCHOOL_COPY[base.school] || SCHOOL_COPY[SCHOOLS.FALLBACK];
  const rarityKey = base.kind === 'hidden' ? 'hidden' : base.kind === 'easter' ? 'easter' : typeId === 'HHHH' ? 'fallback' : 'core';
  const detail = CORE_DETAILS[typeId] || HIDDEN_DETAILS[typeId] || {};
  const eggLine = EGG_LINES[typeId];
  return {
    ...base,
    ...school,
    ...detail,
    rarityKey,
    rarity: RARITY[rarityKey],
    emoji: detail.emoji || (base.kind === 'easter' ? '✨' : '🧩'),
    socialTags: detail.socialTags || ['稀有人格', SCHOOL_COPY[base.school]?.slogan || '隐藏路线'],
    shareLine: detail.shareLine || eggLine || base.quote,
    daily: detail.daily || school.daily,
    shortcoming: detail.shortcoming || school.shortcoming,
    science: detail.science || school.science,
    recommendedBuffs: RECOMMENDED_BUFFS[typeId] || normalizeRecommendedBuffs(base.preferredBuffs),
  };
}

export const SIM_EVENTS = [
  { age: 28, icon: '💼', title: '工作突然按下暂停键', text: '行业波动带来三个月空窗期。', risk: 'cash', cost: 18, good: '应急储备帮你稳住节奏。' },
  { age: 33, icon: '🏥', title: '体检报告亮起黄灯', text: '需要复查并调整一段时间的生活方式。', risk: 'health', cost: 24, good: '医疗回血降低了现金消耗。' },
  { age: 39, icon: '👪', title: '家庭照护任务出现', text: '父母需要更频繁的陪诊和照护安排。', risk: 'family', cost: 20, good: '父母守护让安排更从容。' },
  { age: 46, icon: '🌧️', title: '一次计划外的大支出', text: '生活设备与医疗开销同时到来。', risk: 'cash', cost: 26, good: '现金流护盾吸收了大部分冲击。' },
  { age: 57, icon: '🧭', title: '晚年生活开始排练', text: '你需要在居住、陪伴和自由之间做选择。', risk: 'retire', cost: 22, good: '养老蓄能让选择空间更大。' },
  { age: 68, icon: '🌅', title: '人生进入慢速模式', text: '过去的计划逐渐兑现，也暴露出被忽略的部分。', risk: 'retire', cost: 28, good: '长期规划在此刻持续回血。' },
];

export const MATCH_COPY = {
  same: ['同频兜底搭子', '你们的安全感来源非常相似，做决定快，但也容易一起放大同一种盲区。'],
  complement: ['互补型安全垫', '一个负责把日子过出火花，一个负责把风险写进清单，分工明确时非常稳。'],
  adventure: ['快乐冒险联盟', '你们很会创造新生活，但重要约定最好落到金额、时间和责任人。'],
  mystery: ['玄学现实联队', '好运负责鼓劲，现实计划负责托底；允许彼此用不同方式面对不确定性。'],
};

export function matchProfiles(firstId, secondId) {
  const a = getProfile(firstId);
  const b = getProfile(secondId);
  let key = 'complement';
  if (a.school === b.school) key = 'same';
  else if ([a.school, b.school].includes(SCHOOLS.MYSTIC)) key = 'mystery';
  else if ([a.school, b.school].includes(SCHOOLS.FANTASY)) key = 'adventure';
  const [title, text] = MATCH_COPY[key];
  const score = key === 'same' ? 82 : key === 'complement' ? 91 : key === 'adventure' ? 86 : 79;
  return { a, b, title, text, score };
}

export const DISCLAIMER = '本测试为趣味人格娱乐内容，仅作风险观念科普参考，不构成任何金融产品推介、投保建议。';
