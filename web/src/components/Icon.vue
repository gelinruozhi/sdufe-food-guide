<template>
  <svg
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="ICONS[name] || ICONS.generic"
  />
</template>

<script>
// 统一线性图标（24x24）。实心图标在元素上显式 fill="currentColor" stroke="none"。
const ICONS = {
  /* ---------- UI ---------- */
  home: '<path d="M3.5 11 L12 4 l8.5 7"/><path d="M5.5 9.8 V19.5 a1 1 0 0 0 1 1 H10 v-6 h4 v6 h3.5 a1 1 0 0 0 1-1 V9.8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.4 16.4 L21 21"/>',
  plus: '<path d="M12 5 v14 M5 12 h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20 c0-3.6 3.4-6 7.5-6 s7.5 2.4 7.5 6"/>',
  star: '<path d="M12 3.6 l2.5 5.2 5.7.8 -4.1 4 1 5.6 -5.1-2.7 -5.1 2.7 1-5.6 -4.1-4 5.7-.8 z"/>',
  starFill:
    '<path fill="currentColor" stroke="none" d="M12 3.6 l2.5 5.2 5.7.8 -4.1 4 1 5.6 -5.1-2.7 -5.1 2.7 1-5.6 -4.1-4 5.7-.8 z"/>',
  thumbUp:
    '<path d="M4 11 h3 v9 H4 a1 1 0 0 1-1-1 v-7 a1 1 0 0 1 1-1 z"/><path d="M7 11 v9 h10.4 a2 2 0 0 0 2-1.7 l1.3-6.2 a1.7 1.7 0 0 0-1.7-2.1 H14 l.8-3.3 a1.8 1.8 0 0 0-3-1.6 z"/>',
  thumbDown:
    '<g transform="scale(1,-1) translate(0,-24)"><path d="M4 11 h3 v9 H4 a1 1 0 0 1-1-1 v-7 a1 1 0 0 1 1-1 z"/><path d="M7 11 v9 h10.4 a2 2 0 0 0 2-1.7 l1.3-6.2 a1.7 1.7 0 0 0-1.7-2.1 H14 l.8-3.3 a1.8 1.8 0 0 0-3-1.6 z"/></g>',
  heart:
    '<path d="M12 20.3 C5.5 15.4 3.2 12.3 3.2 9.2 A4.2 4.2 0 0 1 12 7.3 a4.2 4.2 0 0 1 8.8 1.9 c0 3.1-2.3 6.2-8.8 11.1 z"/>',
  flag: '<path d="M5 21 V4.5 M5 4.5 h12 l-2 4 2 4 H5"/>',
  location:
    '<path d="M12 21 c-4-4.8-6-8-6-10.5 a6 6 0 0 1 12 0 c0 2.5-2 5.7-6 10.5 z"/><circle cx="12" cy="10.5" r="2.2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2 V12 l3.4 2"/>',
  back: '<path d="M14.5 5.5 l-6 6 6 6"/>',
  next: '<path d="M9.5 5.5 l6 6-6 6"/>',
  bolt: '<path fill="currentColor" stroke="none" d="M13 2.5 L5.5 13.5 H11 L10 21.5 l8-11 h-5.5 z"/>',
  sparkle:
    '<path fill="currentColor" stroke="none" d="M12 2 c.6 5.4 2.6 7.4 8 8 -5.4.6-7.4 2.6-8 8 -.6-5.4-2.6-7.4-8-8 5.4-.6 7.4-2.6 8-8 z"/>',
  fire: '<path d="M12 2.6 c.8 2.8-2.2 4.2-2.2 7 a4.2 4.2 0 0 0 8.4 0 c0-2.2-1.2-4-2.4-5 -.2 1-.9 1.6-1.6 1.6.6-1.8-.6-2.8-2.2-3.6 z"/>',
  camera:
    '<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><circle cx="12" cy="13.2" r="3.2"/><path d="M8 7 l1.2-2.4 h5.6 L16 7"/>',
  close: '<path d="M6 6 l12 12 M18 6 L6 18"/>',
  check: '<path d="M4.5 12.5 l5 5 L20 6.5"/>',
  edit: '<path d="M4 20 l4.4-1 L19.8 7.6 16.4 4 5 15.4 z"/><path d="M14 6 l4 4"/>',
  chat:
    '<path d="M4 5 h16 a1 1 0 0 1 1 1 v9 a1 1 0 0 1-1 1 H9 l-4 3.4 V16 H4 a1 1 0 0 1-1-1 V6 a1 1 0 0 1 1-1 z"/>',
  inbox:
    '<path d="M4 13 L5.5 5 h13 L20 13 M4 13 H9 l1 2 h4 l1-2 h5 M4 13 v5 a1 1 0 0 0 1 1 h14 a1 1 0 0 0 1-1 v-5"/>',
  logout:
    '<path d="M14 4 h5 a1 1 0 0 1 1 1 v14 a1 1 0 0 1-1 1 h-5 M10 8 l-4 4 4 4 M6 12 h12"/>',
  shield:
    '<path d="M12 3 l7 2.5 v5.5 c0 4.5-3 7.5-7 9 -4-1.5-7-4.5-7-9 V5.5 z"/><path d="M9 11.8 l2 2 4-4"/>',
  arrow: '<path d="M4.5 12 h14 M13 6 l5.5 6 -5.5 6"/>',

  /* ---------- 食物 ---------- */
  noodles:
    '<path d="M4.5 11 h15 M5.2 11 c.4 4 3.2 7 6.8 7 s6.4-3 6.8-7"/><path d="M8.5 3.2 L11 11 M11.4 3.2 L14 11"/>',
  rice: '<path d="M4.5 12 h15 l-1.4 6.4 a2 2 0 0 1-2 1.6 H7.9 a2 2 0 0 1-2-1.6 z"/><path d="M8.5 11.4 c0-2.2 7-2.2 7 0"/><path d="M10 6.6 c-1-1 1-1.6 0-2.6 M14 6.6 c-1-1 1-1.6 0-2.6"/>',
  hotpot:
    '<path d="M3.5 10 h17 l-1.5 7 a2 2 0 0 1-2 1.5 H7 a2 2 0 0 1-2-1.5 z"/><path d="M9 3.5 v6.5 M12 2.8 V10 M15 3.5 v6.5"/>',
  chicken:
    '<path d="M13.5 3.4 c4 0 7 3 7 6.8 0 5-5 8.3-9 8.3 -3.2 0-6.2-2.2-6.2-5 0-4 4-10 8.2-10 z"/><path d="M15 3.6 L19 2.2 M16.6 5 l2.8 1.2"/>',
  drink:
    '<path d="M7.2 8 h9.6 l-1 11.6 a1.5 1.5 0 0 1-1.5 1.4 h-4.6 a1.5 1.5 0 0 1-1.5-1.4 z"/><path d="M7.2 8 c0-1.5 9.6-1.5 9.6 0"/><path d="M14 3.2 l1 4.8"/>',
  powder:
    '<path d="M4.5 11 h15 M5.2 11 c.4 4 3.2 7 6.8 7 s6.4-3 6.8-7"/><path d="M8.5 8 c1.5 1 5.5 1 7 0 M9 6 c1.5 1 4.5 1 6 0"/>',
  congee:
    '<path d="M4.5 11 h15 M5.2 11 c.4 4 3.2 7 6.8 7 s6.4-3 6.8-7"/><path d="M8.5 11 h7"/><path d="M10 6.6 c-1-1 1-1.6 0-2.6 M14 6.6 c-1-1 1-1.6 0-2.6"/>',
  dumpling:
    '<path d="M4 13 c0-4 4-7 8-7 s8 3 8 7 c0 2-16 2-16 0 z"/><path d="M9 6.6 L8 9 M12 6 V9 M15 6.6 L16 9"/>',
  jianbing:
    '<rect x="6" y="4" width="12" height="16" rx="3"/><path d="M9.5 9 c2-1.5 3.5 1.5 1.5 2.5 M12 12 c2-1.5 3.5 1.5 1.5 2.5"/>',
  skewer:
    '<path d="M6 3.5 L18 20.5"/><circle cx="9.2" cy="8.2" r="1.6"/><circle cx="12.4" cy="12.8" r="1.6"/><circle cx="15.4" cy="17.2" r="1.6"/>',
  salad:
    '<path d="M4.5 11 h15 c-1 5-3.8 8-7.5 8 s-6.5-3-7.5-8 z"/><path d="M9 9 c-1-2 2-3 1-5 M13 9 c1-2-1-3 0-5 M11 10 c0-2 3-2 3-4"/>',
  bao: '<path d="M5 13 c0-4 3.2-7 7-7 s7 3 7 7 c0 1.5-14 1.5-14 0 z"/><path d="M9 7 l-1 2 M12 6 v3 M15 7 l1 2"/>',
  cake: '<path d="M5 12 h14 v4.8 a2 2 0 0 1-2 2 H7 a2 2 0 0 1-2-2 z"/><path d="M8 12 c0-2 2.6-1.8 3-3.4 M13 12 c0-2 2.6-1.8 3-3.4"/><circle cx="12" cy="6.4" r="1.2"/>',
  generic:
    '<path d="M4.5 11 h15 M5.2 11 c.4 4 3.2 7 6.8 7 s6.4-3 6.8-7"/><path d="M9 3.5 L11.5 11 M11.5 3.5 L14 11"/>',
};

export default {
  name: 'Icon',
  props: {
    name: { type: String, default: 'generic' },
    size: { type: [Number, String], default: 22 },
    strokeWidth: { type: [Number, String], default: 2 },
  },
  data: () => ({ ICONS }),
};
</script>
