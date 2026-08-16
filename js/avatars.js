/**
 * 保命TI 人格立绘（生成图）
 * 低多边形 / 16Personalities 风格，已转 webp 压缩
 */

const AVATAR_BASE = './images/avatars-cutout-v3';

/** 所有已生成立绘的人格 id */
export const AVATAR_IDS = [
  'LESER', 'YOLO', 'EMMM', 'COVERED', 'HOARDER', 'PLANNER',
  'TECHIE', 'COHO', 'DINK', 'LUCKY', 'HHHH',
  'NAKED', 'DENY', 'STUB', 'LAZY', 'BLINDER', 'FATAL', 'DDL', 'NOPE',
  'WORRY', 'CHILL', 'SMART', 'MONK',
  'LEGACY', 'PET', 'STASH',
  'KARMA', 'FENG', 'ASTRAL', 'ANCE',
  'MAXED', 'VOID',
];

export function avatarUrl(typeId) {
  const id = AVATAR_IDS.includes(typeId) ? typeId : 'HHHH';
  return `${AVATAR_BASE}/${id}.webp?v=1`;
}

/**
 * 在容器内挂载立绘图片
 * @param {HTMLElement} container
 * @param {string} typeId
 */
export function mountAvatar(container, typeId) {
  container.innerHTML = '';
  const img = document.createElement('img');
  img.className = 'avatar-img';
  img.alt = typeId;
  img.width = 280;
  img.height = 280;
  img.decoding = 'async';
  img.src = avatarUrl(typeId);
  img.onerror = () => {
    img.src = avatarUrl('HHHH');
  };
  container.appendChild(img);
}
