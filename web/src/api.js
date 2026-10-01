// 后端 API 封装：token 管理、JSON 请求、图片上传
const TOKEN_KEY = 'sdufe_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, options = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body = options.body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(path, {
    method: options.method || 'GET',
    headers,
    body,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || `请求失败 (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// 上传单张图片，返回可访问的 URL（/uploads/xxx）
export async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await api('/api/upload', { method: 'POST', body: fd });
  return r.url || r.path || r.data?.url;
}
