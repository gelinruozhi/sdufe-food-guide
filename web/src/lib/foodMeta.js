// 品类 → 食物符号 + 食欲渐变，保证离线可用、视觉统一
// [emoji, 起始色, 结束色]
const MAP = {
  麻辣烫: ['🍲', '#ff6b4a', '#ff9a5a'],
  香锅: ['🥘', '#ff6b4a', '#ff9a5a'],
  川菜: ['🌶️', '#ff5a36', '#ff8a66'],
  炒鸡: ['🍗', '#f97316', '#fb923c'],
  焖锅米饭: ['🍗', '#ff9f43', '#ffc53d'],
  米饭: ['🍚', '#ff9f43', '#ffc53d'],
  焖锅: ['🍲', '#ff8a5c', '#ffb27d'],
  卤味饭: ['🍖', '#e8893c', '#f5b971'],
  烤肉: ['🥩', '#d97041', '#f0a878'],
  炸串: ['🍢', '#fb923c', '#fbbf24'],
  夜市小吃: ['🍢', '#fb923c', '#fbbf24'],
  面食: ['🍜', '#f7b733', '#fcde7c'],
  米线: ['🍜', '#5aa9e6', '#8fc8f0'],
  粉类: ['🍜', '#4ecdc4', '#88e0d8'],
  粉面: ['🍜', '#4ecdc4', '#88e0d8'],
  水饺: ['🥟', '#f7b733', '#fcde7c'],
  馄饨: ['🥣', '#4ecdc4', '#88e0d8'],
  饼类: ['🥞', '#ffc53d', '#ffd97d'],
  早餐: ['🥟', '#ffc53d', '#ffd97d'],
  粥点: ['🥣', '#4ecdc4', '#88e0d8'],
  汤类: ['🍲', '#4ecdc4', '#88e0d8'],
  鱼类米饭: ['🐟', '#5aa9e6', '#8fc8f0'],
  鱼类: ['🐟', '#5aa9e6', '#8fc8f0'],
  盖浇饭: ['🍱', '#fb923c', '#fbbf24'],
  铁板饭: ['🍳', '#f59e0b', '#fcd34d'],
  日式米饭: ['🍳', '#b088f9', '#cba6ff'],
  自助餐: ['🍛', '#3ddc97', '#7be8b8'],
  韩餐: ['🍱', '#b088f9', '#cba6ff'],
  小吃: ['🥟', '#f7b733', '#fcde7c'],
  轻食: ['🥗', '#3ddc97', '#7be8b8'],
  西餐: ['🧀', '#ffc53d', '#ffd97d'],
  甜品: ['🍓', '#ff8fb1', '#ffb3cc'],
};

const FALLBACK = ['🍴', '#ffb27d', '#ffd0a8'];

export function foodMeta(category) {
  const cat = category || '';
  let hit = MAP[cat];
  if (!hit) {
    const key = Object.keys(MAP).find(
      (k) => cat.includes(k) || k.includes(cat)
    );
    if (key) hit = MAP[key];
  }
  const [emoji, from, to] = hit || FALLBACK;
  return {
    emoji,
    from,
    to,
    gradient: `linear-gradient(135deg, ${from}, ${to})`,
  };
}
