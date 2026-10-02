// 品类 → 线描食物图标 + 荧光撞色背景（无 emoji）
// fg 为图标描边色：亮底用黑，深底用白。

const PALETTES = {
  acid: { bg: 'linear-gradient(135deg,#d8ff14,#9ed400)', fg: '#0c0c0e' },
  hot: { bg: 'linear-gradient(135deg,#ff45a1,#d1116f)', fg: '#fff' },
  volt: { bg: 'linear-gradient(135deg,#8f72ff,#5a3bd6)', fg: '#fff' },
  orange: { bg: 'linear-gradient(135deg,#ff7d1a,#e04f00)', fg: '#fff' },
  cyan: { bg: 'linear-gradient(135deg,#35e8ff,#0aa8c4)', fg: '#0c0c0e' },
  yellow: { bg: 'linear-gradient(135deg,#ffe600,#e6a800)', fg: '#0c0c0e' },
};

// [关键词, 图标, 配色]，按顺序首次命中
const RULES = [
  ['螺蛳粉', 'powder', 'hot'],
  ['麻辣烫', 'hotpot', 'orange'],
  ['麻辣拌', 'hotpot', 'orange'],
  ['香锅', 'hotpot', 'orange'],
  ['火锅', 'hotpot', 'orange'],
  ['烤串', 'skewer', 'hot'],
  ['炸串', 'skewer', 'hot'],
  ['串', 'skewer', 'hot'],
  ['奶茶', 'drink', 'cyan'],
  ['饮品', 'drink', 'cyan'],
  ['饮料', 'drink', 'cyan'],
  ['水果捞', 'cake', 'hot'],
  ['甜品', 'cake', 'hot'],
  ['蛋糕', 'cake', 'hot'],
  ['烘焙', 'cake', 'hot'],
  ['沙拉', 'salad', 'acid'],
  ['轻食', 'salad', 'acid'],
  ['粥', 'congee', 'yellow'],
  ['水饺', 'dumpling', 'volt'],
  ['饺子', 'dumpling', 'volt'],
  ['煎饼', 'jianbing', 'yellow'],
  ['卷', 'jianbing', 'yellow'],
  ['饼', 'jianbing', 'yellow'],
  ['包子', 'bao', 'yellow'],
  ['早餐', 'bao', 'yellow'],
  ['炒鸡', 'chicken', 'orange'],
  ['炸鸡', 'chicken', 'orange'],
  ['鸡腿', 'chicken', 'orange'],
  ['鸡', 'chicken', 'orange'],
  ['刀削', 'noodles', 'volt'],
  ['拉面', 'noodles', 'volt'],
  ['面', 'noodles', 'volt'],
  ['粉', 'powder', 'hot'],
  ['酸菜鱼', 'rice', 'acid'],
  ['盖浇饭', 'rice', 'acid'],
  ['盖饭', 'rice', 'acid'],
  ['蛋包饭', 'rice', 'acid'],
  ['拌饭', 'rice', 'acid'],
  ['炒饭', 'rice', 'acid'],
  ['黄焖', 'rice', 'acid'],
  ['米饭', 'rice', 'acid'],
  ['饭', 'rice', 'acid'],
];

export function foodMeta(category = '') {
  const key = String(category);
  let icon = 'generic';
  let pal = 'volt';
  for (const [kw, ic, pl] of RULES) {
    if (key.includes(kw)) {
      icon = ic;
      pal = pl;
      break;
    }
  }
  const p = PALETTES[pal];
  return { icon, bg: p.bg, fg: p.fg, palette: pal };
}
