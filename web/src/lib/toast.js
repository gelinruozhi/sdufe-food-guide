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
  .toast-wrap{position:fixed;left:0;right:0;top:13%;z-index:9999;display:flex;
    flex-direction:column;align-items:center;gap:10px;pointer-events:none}
  .toast{max-width:84%;display:flex;align-items:center;gap:9px;background:#1a1a20;
    color:#f4f4ee;font-size:13px;font-weight:700;padding:10px 15px;border-radius:4px;
    border:2px solid #f4f4ee;box-shadow:4px 4px 0 #ccff00;
    animation:toastIn .28s cubic-bezier(.2,1.2,.4,1) both}
  .toast .ti{width:20px;height:20px;border-radius:3px;display:flex;align-items:center;
    justify-content:center;font-size:12px;font-weight:900;flex:none;border:1.5px solid #000}
  .toast-success .ti{background:#ccff00;color:#000}
  .toast-fail .ti{background:#ff2e93;color:#fff}
  .toast.leaving{animation:toastOut .22s ease both}
  @keyframes toastIn{from{opacity:0;transform:translateY(-12px) scale(.94)}
    to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes toastOut{to{opacity:0;transform:translateY(-8px)}}`;
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
