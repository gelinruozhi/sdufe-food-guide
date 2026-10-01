// 轻量命令式 Toast，自包含样式，不依赖组件库
let wrap;

const ICONS = {
  success: '✓',
  fail: '✕',
  text: '',
};

function ensureStyle() {
  if (document.getElementById('toast-style')) return;
  const s = document.createElement('style');
  s.id = 'toast-style';
  s.textContent = `
  .toast-wrap{position:fixed;left:0;right:0;top:14%;z-index:9999;display:flex;
    flex-direction:column;align-items:center;gap:9px;pointer-events:none}
  .toast{max-width:80%;display:flex;align-items:center;gap:8px;background:rgba(36,26,18,.92);
    color:#fff;font-size:13.5px;font-weight:600;padding:11px 18px;border-radius:999px;
    box-shadow:0 12px 30px rgba(0,0,0,.22);animation:toastIn .3s cubic-bezier(.34,1.56,.64,1) both}
  .toast .ti{width:19px;height:19px;border-radius:50%;display:flex;align-items:center;
    justify-content:center;font-size:12px;font-weight:900;flex:none}
  .toast-success .ti{background:#22b573;color:#fff}
  .toast-fail .ti{background:#ff5a36;color:#fff}
  .toast.leaving{animation:toastOut .25s ease both}
  @keyframes toastIn{from{opacity:0;transform:translateY(-14px) scale(.9)}
    to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes toastOut{to{opacity:0;transform:translateY(-10px)}}`;
  document.head.appendChild(s);
}

function show(msg, type = 'text', duration = 1800) {
  ensureStyle();
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icon = ICONS[type];
  el.innerHTML =
    (icon ? `<span class="ti">${icon}</span>` : '') + `<span></span>`;
  el.querySelector('span:last-child').textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 250);
  }, duration);
}

export const toast = (msg) => show(msg, 'text');
toast.success = (msg) => show(msg, 'success');
toast.fail = (msg) => show(msg, 'fail');
