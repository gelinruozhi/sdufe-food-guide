import { Router } from 'express';
import { db } from '../db.js';
import { verifyToken, optionalAuth } from '../auth.js';

const r = Router();

// 反馈类型枚举 -> 中文标签
export const FEEDBACK_TYPES = {
  suggestion: '产品建议',
  bug: '问题 / Bug',
  content: '内容问题',
  other: '其他',
};

// 提交限流：登录用户 30 秒一次，未登录按 IP 60 秒一次
const last = new Map();
function limited(key, gap) {
  const now = Date.now();
  const t = last.get(key) || 0;
  if (now - t < gap) return true;
  last.set(key, now);
  return false;
}

function parseRow(f) {
  let images = [];
  try {
    images = JSON.parse(f.images || '[]');
  } catch {
    images = [];
  }
  return { ...f, images };
}

// 提交反馈（登录可选）
r.post('/', optionalAuth, (req, res) => {
  const body = req.body || {};
  const type = FEEDBACK_TYPES[body.type] ? body.type : 'other';
  const content = String(body.content || '').trim();
  if (content.length < 3) {
    return res.status(400).json({ error: '请填写至少 3 个字的反馈内容' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ error: '反馈内容请控制在 1000 字以内' });
  }
  const contact = body.contact ? String(body.contact).slice(0, 100) : null;
  let images = [];
  if (Array.isArray(body.images)) {
    images = body.images
      .filter((x) => typeof x === 'string')
      .slice(0, 3)
      .map((x) => x.slice(0, 300));
  }

  const uid = req.user ? req.user.id : null;
  const key = uid ? `u${uid}` : `ip${req.ip || ''}`;
  if (limited(key, uid ? 30000 : 60000)) {
    return res.status(429).json({ error: '提交太频繁，请稍后再试' });
  }

  const info = db
    .prepare(
      `INSERT INTO feedback (user_id, type, content, contact, images)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(uid, type, content, contact, JSON.stringify(images));
  res.json({ ok: true, id: info.lastInsertRowid });
});

// 我的反馈（需登录）
r.get('/mine', verifyToken, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM feedback WHERE user_id=? ORDER BY id DESC')
    .all(req.user.id);
  res.json({ feedback: rows.map(parseRow) });
});

export default r;
