import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, verifyToken } from '../auth.js';

const r = Router();

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    nickname: u.nickname,
    role: u.role,
    credit_score: u.credit_score,
    created_at: u.created_at,
  };
}

// 注册
r.post('/register', (req, res) => {
  const { username, password, nickname } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: '用户名需为 3-20 位字母、数字或下划线' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少 6 位' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username=?').get(username);
  if (exists) return res.status(409).json({ error: '用户名已被注册' });

  const info = db
    .prepare('INSERT INTO users (username,password_hash,nickname) VALUES (?,?,?)')
    .run(username, bcrypt.hashSync(password, 10), nickname || username);
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
  res.json({ token: signToken(user), user: publicUser(user) });
});

// 登录
r.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  if (user.status === 'banned') {
    return res.status(403).json({ error: '账号已被封禁' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

// 当前用户
r.get('/me', verifyToken, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default r;
