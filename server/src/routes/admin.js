import { Router } from 'express';
import { db } from '../db.js';
import { verifyToken, requireAdmin } from '../auth.js';

const r = Router();
r.use(verifyToken, requireAdmin);

// 概览统计
r.get('/stats', (_req, res) => {
  const count = (sql, ...p) => db.prepare(sql).get(...p).c;
  res.json({
    stats: {
      users: count('SELECT COUNT(*) c FROM users'),
      stalls_approved: count("SELECT COUNT(*) c FROM stalls WHERE status='approved'"),
      stalls_pending: count("SELECT COUNT(*) c FROM stalls WHERE status='pending'"),
      reviews: count("SELECT COUNT(*) c FROM reviews WHERE status='normal'"),
      corrections_pending: count("SELECT COUNT(*) c FROM corrections WHERE status='pending'"),
      reports_pending: count("SELECT COUNT(*) c FROM reports WHERE status='pending'"),
    },
  });
});

// 待审核窗口
r.get('/pending-stalls', (_req, res) => {
  const rows = db
    .prepare(`SELECT s.*, u.nickname AS creator_name FROM stalls s
      LEFT JOIN users u ON u.id=s.creator_id
      WHERE s.status='pending' ORDER BY s.id`)
    .all();
  res.json({ stalls: rows });
});

// 通过
r.post('/stalls/:id/approve', (req, res) => {
  const s = db.prepare('SELECT * FROM stalls WHERE id=?').get(req.params.id);
  if (!s) return res.status(404).json({ error: '窗口不存在' });
  db.prepare("UPDATE stalls SET status='approved', updated_at=datetime('now','localtime') WHERE id=?")
    .run(s.id);
  if (s.creator_id) {
    db.prepare('UPDATE users SET credit_score=credit_score+2 WHERE id=?').run(s.creator_id);
  }
  res.json({ ok: true });
});

// 驳回
r.post('/stalls/:id/reject', (req, res) => {
  const s = db.prepare('SELECT id FROM stalls WHERE id=?').get(req.params.id);
  if (!s) return res.status(404).json({ error: '窗口不存在' });
  db.prepare("UPDATE stalls SET status='rejected', updated_at=datetime('now','localtime') WHERE id=?")
    .run(s.id);
  res.json({ ok: true, reason: (req.body || {}).reason || '' });
});

// 下架
r.post('/stalls/:id/offline', (req, res) => {
  const s = db.prepare('SELECT id FROM stalls WHERE id=?').get(req.params.id);
  if (!s) return res.status(404).json({ error: '窗口不存在' });
  db.prepare("UPDATE stalls SET status='offline', updated_at=datetime('now','localtime') WHERE id=?")
    .run(s.id);
  res.json({ ok: true });
});

// 待处理纠错
r.get('/corrections', (_req, res) => {
  const rows = db
    .prepare(`SELECT c.*, s.name AS stall_name, u.nickname AS user_name FROM corrections c
      JOIN stalls s ON s.id=c.stall_id
      LEFT JOIN users u ON u.id=c.user_id
      WHERE c.status='pending' ORDER BY c.id`)
    .all();
  res.json({ corrections: rows });
});

// 处理纠错：action=accept / ignore
r.post('/corrections/:id/handle', (req, res) => {
  const c = db.prepare('SELECT * FROM corrections WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: '纠错不存在' });
  const action = (req.body || {}).action === 'accept' ? 'accepted' : 'ignored';
  db.prepare('UPDATE corrections SET status=? WHERE id=?').run(action, c.id);
  if (action === 'accepted') {
    db.prepare('UPDATE users SET credit_score=credit_score+1 WHERE id=?').run(c.user_id);
  }
  res.json({ ok: true, status: action });
});

// 待处理举报
r.get('/reports', (_req, res) => {
  const rows = db
    .prepare(`SELECT r.*, u.nickname AS user_name FROM reports r
      LEFT JOIN users u ON u.id=r.user_id
      WHERE r.status='pending' ORDER BY r.id`)
    .all();
  res.json({ reports: rows });
});

// 处理举报：action=ignore / remove（remove 时下架对应窗口或隐藏评价）
r.post('/reports/:id/handle', (req, res) => {
  const rep = db.prepare('SELECT * FROM reports WHERE id=?').get(req.params.id);
  if (!rep) return res.status(404).json({ error: '举报不存在' });
  const action = (req.body || {}).action;
  if (action === 'remove') {
    if (rep.target_type === 'stall') {
      db.prepare("UPDATE stalls SET status='offline' WHERE id=?").run(rep.target_id);
    } else if (rep.target_type === 'review') {
      db.prepare("UPDATE reviews SET status='hidden' WHERE id=?").run(rep.target_id);
      const rv = db.prepare('SELECT stall_id FROM reviews WHERE id=?').get(rep.target_id);
      if (rv) {
        const row = db
          .prepare("SELECT COALESCE(SUM(star),0) s, COUNT(*) c FROM reviews WHERE stall_id=? AND status='normal'")
          .get(rv.stall_id);
        db.prepare('UPDATE stalls SET star_sum=?, rating_count=? WHERE id=?')
          .run(row.s, row.c, rv.stall_id);
      }
    }
  }
  db.prepare("UPDATE reports SET status='handled' WHERE id=?").run(rep.id);
  res.json({ ok: true });
});

export default r;
