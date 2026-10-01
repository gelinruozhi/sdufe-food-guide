import jwt from 'jsonwebtoken';
import { db } from './db.js';

export const JWT_SECRET = 'sdufe-food-guide-dev-secret-change-in-production';
export const JWT_EXPIRES = '7d';

export function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

function readToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

// 必须登录
export function verifyToken(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ error: '请先登录' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(payload.id);
    if (!user) return res.status(401).json({ error: '用户不存在' });
    if (user.status === 'banned') return res.status(403).json({ error: '账号已被封禁' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

// 登录可选（有则挂 req.user）
export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT * FROM users WHERE id=?').get(payload.id);
      if (user && user.status !== 'banned') req.user = user;
    } catch {
      /* 忽略无效 token */
    }
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
}
