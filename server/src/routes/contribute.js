import { Router } from 'express';
import { db } from '../db.js';
import { verifyToken } from '../auth.js';

const r = Router();

// 投稿新窗口
r.post('/', verifyToken, (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.category) {
    return res.status(400).json({ error: '窗口名称和品类为必填' });
  }
  // 每日投稿上限
  const today = db
    .prepare("SELECT COUNT(*) c FROM stalls WHERE creator_id=? AND source='contributed' AND date(created_at)=date('now','localtime')")
    .get(req.user.id).c;
  if (today >= 5) return res.status(429).json({ error: '今日投稿已达 5 条上限' });

  // 查重
  const dup = db
    .prepare("SELECT id,name,status FROM stalls WHERE name=? AND status IN ('approved','pending') AND COALESCE(canteen_id,0)=COALESCE(?,0)")
    .get(b.name, b.canteen_id || null);
  if (dup) {
    return res.status(409).json({ error: `已存在同名窗口「${dup.name}」，可直接在该窗口纠错补充` });
  }

  const type = b.stall_type === 'outside' ? 'outside' : 'inside';
  const info = db.prepare(`
    INSERT INTO stalls (stall_type,canteen_id,floor_id,name,category,avg_price,business_hours,
      description,address,phone,delivery_supported,delivery_platform,delivery_fee,min_order,
      source,creator_id,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    type,
    type === 'inside' ? (b.canteen_id || null) : null,
    type === 'inside' ? (b.floor_id || null) : null,
    String(b.name).slice(0, 30),
    String(b.category).slice(0, 15),
    Number(b.avg_price) || 0,
    b.business_hours || '',
    String(b.description || '').slice(0, 300),
    b.address || null,
    b.phone || null,
    b.delivery_supported ? 1 : 0,
    b.delivery_platform || null,
    Number(b.delivery_fee) || null,
    Number(b.min_order) || null,
    'contributed', req.user.id, 'pending'
  );
  res.json({ ok: true, id: info.lastInsertRowid });
});

// 窗口纠错
r.post('/stalls/:id/correction', verifyToken, (req, res) => {
  const sid = Number(req.params.id);
  const stall = db.prepare('SELECT id FROM stalls WHERE id=?').get(sid);
  if (!stall) return res.status(404).json({ error: '窗口不存在' });
  const { field_name, suggestion } = req.body || {};
  if (!field_name || !suggestion) {
    return res.status(400).json({ error: '请填写纠错字段与建议内容' });
  }
  db.prepare('INSERT INTO corrections (stall_id,user_id,field_name,suggestion) VALUES (?,?,?,?)')
    .run(sid, req.user.id, String(field_name).slice(0, 20), String(suggestion).slice(0, 200));
  res.json({ ok: true });
});

// 我的投稿与纠错
r.get('/mine', verifyToken, (req, res) => {
  const stalls = db
    .prepare("SELECT id,name,category,status,created_at FROM stalls WHERE creator_id=? AND source='contributed' ORDER BY id DESC")
    .all(req.user.id);
  const corrections = db
    .prepare(`SELECT c.id,c.field_name,c.suggestion,c.status,c.created_at,s.name AS stall_name
      FROM corrections c JOIN stalls s ON s.id=c.stall_id
      WHERE c.user_id=? ORDER BY c.id DESC`)
    .all(req.user.id);
  res.json({ stalls, corrections });
});

export default r;
