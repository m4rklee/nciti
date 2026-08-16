/**
 * 保命TI测试 · 题库与人格数据
 * 选项标签以正文为准；Q3-C 正文曾标 PLANNER，与彩蛋表 CHILL 冲突，按彩蛋专属位取 CHILL。
 */

export const SCHOOLS = {
  BARE: 'bare', // 裸奔硬扛派
  SYSTEM: 'system', // 制度兜底派
  FANTASY: 'fantasy', // 养老幻想派
  MYSTIC: 'mystic', // 玄学兜底派
  FALLBACK: 'fallback', // 兜底&隐藏
};

/** 流派中文名（仅展示用） */
export const SCHOOL_LABELS = {
  [SCHOOLS.BARE]: '裸奔硬扛派',
  [SCHOOLS.SYSTEM]: '制度兜底派',
  [SCHOOLS.FANTASY]: '养老幻想派',
  [SCHOOLS.MYSTIC]: '玄学兜底派',
  [SCHOOLS.FALLBACK]: '兜底&隐藏',
};

/** kind 徽章文案（仅展示用） */
export const KIND_LABELS = {
  core: '核心',
  easter: '彩蛋',
  hidden: '隐藏',
};

/** 流派包含的标签（含核心+彩蛋） */
export const SCHOOL_TAGS = {
  [SCHOOLS.BARE]: [
    'LESER', 'YOLO', 'EMMM', 'NAKED', 'DENY', 'STUB', 'LAZY',
    'BLINDER', 'FATAL', 'DDL', 'NOPE',
  ],
  [SCHOOLS.SYSTEM]: [
    'COVERED', 'HOARDER', 'PLANNER', 'WORRY', 'CHILL', 'SMART', 'MONK',
  ],
  [SCHOOLS.FANTASY]: [
    'TECHIE', 'COHO', 'DINK', 'LEGACY', 'PET', 'STASH',
  ],
  [SCHOOLS.MYSTIC]: [
    'LUCKY', 'KARMA', 'FENG', 'ASTRAL', 'ANCE',
  ],
};

export const CORE_TYPES = [
  'LESER', 'YOLO', 'EMMM', 'COVERED', 'HOARDER', 'PLANNER',
  'TECHIE', 'COHO', 'DINK', 'LUCKY', 'HHHH',
];

/** 彩蛋：专属题 index(0-based) + option key */
export const EASTER_EGGS = {
  LAZY: { q: 0, opt: 'D' },
  NAKED: { q: 1, opt: 'D' },
  MONK: { q: 1, opt: 'C' },
  CHILL: { q: 2, opt: 'C' },
  FATAL: { q: 3, opt: 'D' },
  DENY: { q: 4, opt: 'D' },
  SMART: { q: 5, opt: 'B' },
  BLINDER: { q: 6, opt: 'D' },
  STUB: { q: 7, opt: 'D' },
  WORRY: { q: 8, opt: 'D' },
  NOPE: { q: 9, opt: 'D' },
  DDL: { q: 10, opt: 'D' },
  KARMA: { q: 11, opt: 'A' },
  FENG: { q: 11, opt: 'B' },
  ASTRAL: { q: 11, opt: 'C' },
  ANCE: { q: 11, opt: 'D' },
  STASH: { q: 12, opt: 'B' },
  PET: { q: 17, opt: 'C' },
  LEGACY: { q: 17, opt: 'D' },
};

export const PERSONALITIES = {
  LESER: {
    id: 'LESER',
    en: 'LESER',
    zh: '垃圾乐子人',
    quote: '体检看了失眠，保险买了肉疼，我选择闭眼。',
    preferredBuffs: '全都要（它啥都没有）——重点「重疾护盾+医疗回血」',
    school: SCHOOLS.BARE,
    kind: 'core',
  },
  YOLO: {
    id: 'YOLO',
    en: 'YOLO',
    zh: '裸奔勇者',
    quote: '我是又菜又爱活，就是不想掏保费。',
    preferredBuffs: '意外闪避+重疾护盾（最容易被「突发」打崩）',
    school: SCHOOLS.BARE,
    kind: 'core',
  },
  EMMM: {
    id: 'EMMM',
    en: 'EMMM',
    zh: '犹豫者',
    quote: '保险我研究了三个月，目前的结论是：再研究三个月。',
    preferredBuffs: '重疾护盾+医疗回血',
    school: SCHOOLS.BARE,
    kind: 'core',
  },
  COVERED: {
    id: 'COVERED',
    en: 'COVERED',
    zh: '保命乐子人',
    quote: '我可以不养生，但我不能没有重疾险。毕竟作死也需要本金。',
    preferredBuffs: '重疾护盾+医疗回血',
    school: SCHOOLS.SYSTEM,
    kind: 'core',
  },
  HOARDER: {
    id: 'HOARDER',
    en: 'HOARDER',
    zh: '囤保养生怪',
    quote: '我体检报告比年终总结还厚，保单比快递单还多。',
    preferredBuffs: '养老蓄能+父母守护',
    school: SCHOOLS.SYSTEM,
    kind: 'core',
  },
  PLANNER: {
    id: 'PLANNER',
    en: 'PLANNER',
    zh: '规划侠',
    quote: '我的风险敞口已经对冲完毕，请叫我人生基金经理。',
    preferredBuffs: '养老蓄能+父母守护+日常问诊',
    school: SCHOOLS.SYSTEM,
    kind: 'core',
  },
  TECHIE: {
    id: 'TECHIE',
    en: 'TECHIE',
    zh: '科技养老人',
    quote: '等待未来智能机器人养老，现在买保险干嘛？',
    preferredBuffs: '养老蓄能+税优账户',
    school: SCHOOLS.FANTASY,
    kind: 'core',
  },
  COHO: {
    id: 'COHO',
    en: 'COHO',
    zh: '抱团养老人',
    quote: '不婚不育，但我和闺蜜约好老了住一起互相伺候。',
    preferredBuffs: '父母守护+医疗回血',
    school: SCHOOLS.FANTASY,
    kind: 'core',
  },
  DINK: {
    id: 'DINK',
    en: 'DINK',
    zh: '丁克贵族',
    quote: '不养娃，钱全留给自己，老了去高端养老社区。',
    preferredBuffs: '养老蓄能+税优账户',
    school: SCHOOLS.FANTASY,
    kind: 'core',
  },
  LUCKY: {
    id: 'LUCKY',
    en: 'LUCKY',
    zh: '天选之子',
    quote: '灾祸绕道走，我命硬。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.MYSTIC,
    kind: 'core',
  },
  HHHH: {
    id: 'HHHH',
    en: 'HHHH',
    zh: '傻乐者',
    quote: '哈哈哈哈哈哈哈哈。',
    preferredBuffs: '随机开局（系统替你抽一套，反而最均衡）',
    school: SCHOOLS.FALLBACK,
    kind: 'core',
  },
  NAKED: {
    id: 'NAKED',
    en: 'NAKED',
    zh: '裸奔佛系人',
    quote: '我连感冒都很少，保险那是给别人的。',
    preferredBuffs: '重疾护盾+意外闪避',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  DENY: {
    id: 'DENY',
    en: 'DENY',
    zh: '嘴硬裸奔侠',
    quote: '我的身体我清楚，意外不会找上我。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  STUB: {
    id: 'STUB',
    en: 'STUB',
    zh: '养生拖延人',
    quote: '我的保险计划在等永远不会到来的黄道吉日。',
    preferredBuffs: '重疾护盾+医疗回血',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  LAZY: {
    id: 'LAZY',
    en: 'LAZY',
    zh: '懒癌患者',
    quote: '不是不认同保险，是打开投保页我就困了。',
    preferredBuffs: '重疾护盾+医疗回血',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  BLINDER: {
    id: 'BLINDER',
    en: 'BLINDER',
    zh: '鸵鸟人',
    quote: '风险？什么风险？我看不见它就不存在。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  FATAL: {
    id: 'FATAL',
    en: 'FATAL',
    zh: '天选硬扛人',
    quote: '生死有命，富贵在天，出事我认。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  DDL: {
    id: 'DDL',
    en: 'DDL',
    zh: '赶死线人',
    quote: '出事了？正好，我现在就去研究保险。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  NOPE: {
    id: 'NOPE',
    en: 'NOPE',
    zh: '死扛侠',
    quote: '不用劝，不买就是不买，再说拉黑。',
    preferredBuffs: '重疾护盾+意外闪避',
    school: SCHOOLS.BARE,
    kind: 'easter',
  },
  WORRY: {
    id: 'WORRY',
    en: 'WORRY',
    zh: '焦虑全保人',
    quote: '我保单齐全，但我依然每晚担心明天失业。',
    preferredBuffs: '养老蓄能+父母守护',
    school: SCHOOLS.SYSTEM,
    kind: 'easter',
  },
  CHILL: {
    id: 'CHILL',
    en: 'CHILL',
    zh: '佛系保命人',
    quote: '保险我买了，焦虑我不要，快乐我全要。',
    preferredBuffs: '重疾护盾+医疗回血',
    school: SCHOOLS.SYSTEM,
    kind: 'easter',
  },
  SMART: {
    id: 'SMART',
    en: 'SMART',
    zh: '精算乐子人',
    quote: '我又不是不买，我只是不瞎买。',
    preferredBuffs: '重疾护盾+医疗回血',
    school: SCHOOLS.SYSTEM,
    kind: 'easter',
  },
  MONK: {
    id: 'MONK',
    en: 'MONK',
    zh: '躺平存钱人',
    quote: '保险我不信，但我信余额。余额会背叛我吗？会。',
    preferredBuffs: '养老蓄能+医疗回血',
    school: SCHOOLS.SYSTEM,
    kind: 'easter',
  },
  LEGACY: {
    id: 'LEGACY',
    en: 'LEGACY',
    zh: '啃老预备役',
    quote: '我养老靠爸妈，爸妈养老靠爸妈的爸妈。',
    preferredBuffs: '父母守护+养老蓄能',
    school: SCHOOLS.FANTASY,
    kind: 'easter',
  },
  PET: {
    id: 'PET',
    en: 'PET',
    zh: '毛孩子养老人',
    quote: '不生孩子养猫，毛孩子比儿女靠谱，还不用考编。',
    preferredBuffs: '医疗回血+日常问诊',
    school: SCHOOLS.FANTASY,
    kind: 'easter',
  },
  STASH: {
    id: 'STASH',
    en: 'STASH',
    zh: '养生守财人',
    quote: '我余额宝比保单厚，因为保单我一张都没有。',
    preferredBuffs: '养老蓄能+税优账户',
    school: SCHOOLS.FANTASY,
    kind: 'easter',
  },
  KARMA: {
    id: 'KARMA',
    en: 'KARMA',
    zh: '积德人',
    quote: '好人一生平安，我多做善事自然兜底。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.MYSTIC,
    kind: 'easter',
  },
  FENG: {
    id: 'FENG',
    en: 'FENG',
    zh: '风水人',
    quote: '保险不如我客厅那串转运珠。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.MYSTIC,
    kind: 'easter',
  },
  ASTRAL: {
    id: 'ASTRAL',
    en: 'ASTRAL',
    zh: '星座人',
    quote: '这个月水逆，巨蟹座才需要重疾险，我是射手不用。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.MYSTIC,
    kind: 'easter',
  },
  ANCE: {
    id: 'ANCE',
    en: 'ANCE',
    zh: '祖宗保佑人',
    quote: '祖上积德，祖宗会罩着我。',
    preferredBuffs: '意外闪避+重疾护盾',
    school: SCHOOLS.MYSTIC,
    kind: 'easter',
  },
  MAXED: {
    id: 'MAXED',
    en: 'MAXED',
    zh: '满级保命人',
    quote: '保险、存款、父母、规划，我全齐了，而且我不焦虑。',
    preferredBuffs: '父母守护+养老蓄能',
    school: SCHOOLS.FALLBACK,
    kind: 'hidden',
  },
  VOID: {
    id: 'VOID',
    en: 'VOID',
    zh: '真·裸奔人',
    quote: '保单？我连社保都快忘了缴。',
    preferredBuffs: '重疾护盾+意外闪避',
    school: SCHOOLS.FALLBACK,
    kind: 'hidden',
  },
};

/** 核心类型（不含 HHHH 兜底，HHHH 单独判定） */
export const SCORABLE_CORES = [
  'LESER', 'YOLO', 'EMMM', 'COVERED', 'HOARDER', 'PLANNER',
  'TECHIE', 'COHO', 'DINK', 'LUCKY',
];

/**
 * 20 题。选项 tag 以正文标注为准（Q3-D = YOLO）。
 */
export const QUESTIONS = [
  {
    id: 'Q1',
    section: '身体习惯',
    text: '你的「续命饮料」通常是？',
    options: [
      { key: 'A', text: '全糖奶茶加椰果', tag: 'LESER' },
      { key: 'B', text: '养生壶煮枸杞，严格作息', tag: 'HOARDER' },
      { key: 'C', text: '冰美式，不碍熬夜', tag: 'YOLO' },
      { key: 'D', text: '功能饮料续命专用，没力气想别的', tag: 'LAZY' },
    ],
  },
  {
    id: 'Q2',
    section: '身体习惯',
    text: '体检，你多久一次？',
    options: [
      { key: 'A', text: '每年准时，雷打不动', tag: 'PLANNER' },
      { key: 'B', text: '半年一次，能查的全查', tag: 'HOARDER' },
      { key: 'C', text: '公司组织的才去，顺便蹭早餐', tag: 'MONK' },
      { key: 'D', text: '三五年从未体检', tag: 'NAKED' },
    ],
  },
  {
    id: 'Q3',
    section: '身体习惯',
    text: '深夜11点你在干嘛？',
    options: [
      { key: 'A', text: '追剧+炸鸡，这才是人生', tag: 'LESER' },
      { key: 'B', text: '对比保障条款，失眠纠结', tag: 'EMMM' },
      { key: 'C', text: '早睡早起，坚持晨跑', tag: 'CHILL' },
      { key: 'D', text: '刷手机，想着“明晚一定早睡”', tag: 'YOLO' },
    ],
  },
  {
    id: 'Q4',
    section: '身体习惯',
    text: '你运动吗？',
    options: [
      { key: 'A', text: '每周三次，有氧+力量', tag: 'PLANNER' },
      { key: 'B', text: '走路就算', tag: 'LESER' },
      { key: 'C', text: '办了卡、买了意外险、但只洗澡', tag: 'COVERED' },
      { key: 'D', text: '爬楼梯都嫌累，生死有命', tag: 'FATAL' },
    ],
  },
  {
    id: 'Q5',
    section: '保单观',
    text: '你现在有几份商业保险？',
    options: [
      { key: 'A', text: '重疾+医疗+意外+定寿，齐了', tag: 'HOARDER' },
      { key: 'B', text: '有一两份，自己买的', tag: 'COVERED' },
      { key: 'C', text: '就社保卡，商业的没碰过', tag: 'YOLO' },
      { key: 'D', text: '我妈让我买过，我退了', tag: 'DENY' },
    ],
  },
  {
    id: 'Q6',
    section: '保单观',
    text: '你买保险最主要因为？',
    options: [
      { key: 'A', text: '真怕出事，想兜底', tag: 'COVERED' },
      { key: 'B', text: '爸妈催的，买个安心', tag: 'SMART' },
      { key: 'C', text: '我还没买呢…还在比哪款好', tag: 'EMMM' },
      { key: 'D', text: '我运气好，用不上', tag: 'LUCKY' },
    ],
  },
  {
    id: 'Q7',
    section: '保单观',
    text: '保险代理人加你微信，你？',
    options: [
      { key: 'A', text: '认真听，问清条款', tag: 'PLANNER' },
      { key: 'B', text: '先听着，回头自己查', tag: 'COVERED' },
      { key: 'C', text: '加了三个代理人，一个没回', tag: 'EMMM' },
      { key: 'D', text: '秒删，怕被坑', tag: 'BLINDER' },
    ],
  },
  {
    id: 'Q8',
    section: '保单观',
    text: '你给父母买过保险吗？',
    options: [
      { key: 'A', text: '早配齐了', tag: 'HOARDER' },
      { key: 'B', text: '打算买，正在比', tag: 'PLANNER' },
      { key: 'C', text: '自己都还没买呢', tag: 'YOLO' },
      { key: 'D', text: '知道该买，等发年终奖再说', tag: 'STUB' },
    ],
  },
  {
    id: 'Q9',
    section: '心态/风险',
    text: '刷到「XX突发心梗去世」，你？',
    options: [
      { key: 'A', text: '立刻检查自己保单够不够', tag: 'COVERED' },
      { key: 'B', text: '心慌一下，然后忘了', tag: 'YOLO' },
      { key: 'C', text: '算命的说我命硬，不关我事', tag: 'LUCKY' },
      { key: 'D', text: '我保单齐全，但我还是慌', tag: 'WORRY' },
    ],
  },
  {
    id: 'Q10',
    section: '心态/风险',
    text: '关于买保险，你现在的真实状态是？',
    options: [
      { key: 'A', text: '比了30款，还没决定哪款好', tag: 'EMMM' },
      { key: 'B', text: '天选之人不需要保险', tag: 'LUCKY' },
      { key: 'C', text: '垃圾食品都吃着呢，保险不急', tag: 'LESER' },
      { key: 'D', text: '不用劝，不买就是不买，再说拉黑', tag: 'NOPE' },
    ],
  },
  {
    id: 'Q11',
    section: '心态/风险',
    text: '朋友让你一起买意外险，你？',
    options: [
      { key: 'A', text: '我已经买了', tag: 'COVERED' },
      { key: 'B', text: '研究三天再决定', tag: 'EMMM' },
      { key: 'C', text: '不用，我命硬', tag: 'LUCKY' },
      { key: 'D', text: '出事了？正好，我现在就去研究', tag: 'DDL' },
    ],
  },
  {
    id: 'Q12',
    section: '心态/风险',
    text: '🧙 玄学时间：如果兜底必须选一种玄学，你选？',
    options: [
      { key: 'A', text: '积德，好人有好报', tag: 'KARMA' },
      { key: 'B', text: '风水，转运珠比保单灵', tag: 'FENG' },
      { key: 'C', text: '星座，射手座不需要重疾', tag: 'ASTRAL' },
      { key: 'D', text: '祖宗保佑，祖上积德', tag: 'ANCE' },
    ],
  },
  {
    id: 'Q13',
    section: '钱包/消费',
    text: '发工资第一件事？',
    options: [
      { key: 'A', text: '先转一笔进储蓄/基金', tag: 'PLANNER' },
      { key: 'B', text: '余额存着，但没买保险', tag: 'STASH' },
      { key: 'C', text: '全花，下月再说', tag: 'LESER' },
      { key: 'D', text: '先还花呗，保险？吃完再说', tag: 'YOLO' },
    ],
  },
  {
    id: 'Q14',
    section: '钱包/消费',
    text: '你的「大额支出」一般是？',
    options: [
      { key: 'A', text: '保险、理财、进修', tag: 'HOARDER' },
      { key: 'B', text: '限量、演唱会、潮玩', tag: 'LESER' },
      { key: 'C', text: '说走就走的短途长途旅行', tag: 'YOLO' },
      { key: 'D', text: '丁克养老旅居储备金', tag: 'DINK' },
    ],
  },
  {
    id: 'Q15',
    section: '钱包/消费',
    text: '突然要掏2万块钱，你？',
    options: [
      { key: 'A', text: '储蓄账户足额预留，随时可取', tag: 'PLANNER' },
      { key: 'B', text: '存款可凑齐，不影响正常生活', tag: 'HOARDER' },
      { key: 'C', text: '花呗分期', tag: 'LESER' },
      { key: 'D', text: '临时向亲友周转借钱', tag: 'YOLO' },
    ],
  },
  {
    id: 'Q16',
    section: '钱包/消费',
    text: '你记账吗？',
    options: [
      { key: 'A', text: '记，App里分了12类', tag: 'PLANNER' },
      { key: 'B', text: '不记，反正不够花', tag: 'LESER' },
      { key: 'C', text: '记，但月底发现全花奶茶上了', tag: 'COVERED' },
      { key: 'D', text: '记账是有钱人准备的', tag: 'YOLO' },
    ],
  },
  {
    id: 'Q17',
    section: '脑洞/兜底逻辑',
    text: '朋友问你「以后出事谁管你」，你真实想法是？',
    options: [
      { key: 'A', text: '保险存款提前全部安排到位', tag: 'COVERED' },
      { key: 'B', text: '等我老了有机器人保姆', tag: 'TECHIE' },
      { key: 'C', text: '和好友约定抱团互助养老', tag: 'COHO' },
      { key: 'D', text: '没想过这个问题，过于复杂', tag: 'EMMM' },
    ],
  },
  {
    id: 'Q18',
    section: '脑洞/兜底逻辑',
    text: '如果必须选一个「人生兜底依靠」，你选？',
    options: [
      { key: 'A', text: '保单+存款，最稳', tag: 'HOARDER' },
      { key: 'B', text: '我丁克，钱全留自己', tag: 'DINK' },
      { key: 'C', text: '毛孩子（猫狗）比人靠谱', tag: 'PET' },
      { key: 'D', text: '爸妈（含爸妈的爸妈）', tag: 'LEGACY' },
    ],
  },
  {
    id: 'Q19',
    section: '脑洞/兜底逻辑',
    text: '你对「买保险」的真实态度是？',
    options: [
      { key: 'A', text: '买了，安心', tag: 'COVERED' },
      { key: 'B', text: '该买，但懒得研究', tag: 'LESER' },
      { key: 'C', text: '身体好着呢，不用', tag: 'YOLO' },
      { key: 'D', text: '还需要再研究研究…', tag: 'EMMM' },
    ],
  },
  {
    id: 'Q20',
    section: '脑洞/兜底逻辑',
    text: '关于「未来科技养老」，你信几分？',
    options: [
      { key: 'A', text: '不相信，只有自身规划最可靠', tag: 'PLANNER' },
      { key: 'B', text: '完全相信，机器人养老很快落地', tag: 'TECHIE' },
      { key: 'C', text: '更信赖人与人互相帮扶', tag: 'COHO' },
      { key: 'D', text: '未来太远，走一步看一步', tag: 'DINK' },
    ],
  },
];
