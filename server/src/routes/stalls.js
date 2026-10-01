import { Router } from 'express';
import { db, decorateStall, BAYES_M } from '../db.js';
import { optionalAuth, verifyToken } from '../auth.js';
import { STALL_COLS } from './canteens.js';

const r = Router();

// 窗口列表 / 搜索
r.get('/', optionalAuth, (req, res) => {
  const {
    type, canteen_id, floor_id, keyword, category,
    sort = 'bayes', page = 1, pageSize = 20,
  } = req.query;

  const where = ["status='approved'"];
  const params = [];
  if (type) { where.push('stall_type=?'); params.push(type); }
  if (canteen_id) { where.push('canteen_id=?'); params.push(canteen_id); }
  if (floor_id) { where.push('floor_id=?'); params.push(floor_id); }
  if (category) { where.push('category=?'); params.push(category); }
  if (keyword) {
    where.push('(name LIKE ? OR category LIKE ? OR description LIKE ?)');
    const k = `%${keyword}%`;
    params.push(k, k, k);
  }

  const sql = `SELECT ${STALL_COLS} FROM stalls WHERE ${where.join(' AND ')}`;
  let list = db.prepare(sql).all(...params).map((s) => decorateStall(s));

  switch (sort) {
    case 'price_asc': list.sort((a, b) => a.avg_price - b.avg_price); break;
    case 'price_desc': list.sort((a, b) => b.avg_price - a.avg_price); break;
    case 'newest': list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)); break;
    default: list.sort((a, b) => b.bayes_score - a.bayes_score);
  }

  const p = Math.max(1, Number(page));
  const size = Math.min(50, Number(pageSize));
  const start = (p - 1) * size;
  res.json({
    total: list.length,
    page: p,
    pageSize: size,
    stalls: list.slice(start, start + size),
  });
});

// 红榜
r.get('/ranking/top', (_req, res) => {
  const list = db
    .prepare(`SELECT ${STALL_COLS} FROM stalls WHERE status='approved' AND rating_count>=?`)
    .all(BAYES_M)
    .map((s) => decorateStall(s))
    .sort((a, b) => b.bayes_score - a.bayes_score)
    .slice(0, 10);
  res.json({ stalls: list });
});

// 黑榜
r.get('/ranking/bottom', (_req, res) => {
  const list = db
    .prepare(`SELECT ${STALL_COLS} FROM stalls WHERE status='approved' AND rating_count>=?`)
    .all(BAYES_M)
    .map((s) => decorateStall(s))
    .sort((a, b) => a.bayes_score - b.bayes_score)
    .slice(0, 10);
  res.json({ stalls: list });
});

// 随机吃什么
r.get('/random/eat', (req, res) => {
  const rows = db.prepare(`SELECT ${STALL_COLS} FROM stalls WHERE status='approved'`).all();
  if (!rows.length) return res.status(404).json({ error: '暂无窗口数据' });
  const s = rows[Math.floor(Math.random() * rows.length)];
  res.json({ stall: decorateStall(s) });
});

// 窗口详情
r.get('/:id', optionalAuth, (req, res) => {
  const s = db.prepare(`SELECT ${STALL_COLS} FROM stalls WHERE id=?`).get(req.params.id);
  if (!s) return res.status(404).json({ error: '窗口不存在' });
  const stall = decorateStall(s);

  const canteen = s.canteen_id
    ? db.prepare('SELECT id,name FROM canteens WHERE id=?').get(s.canteen_id)
    : null;
  const floor = s.floor_id
    ? db.prepare('SELECT id,floor_no,name FROM floors WHERE id=?').get(s.floor_id)
    : null;

  const dist = db
    .prepare('SELECT star, COUNT(*) c FROM reviews WHERE stall_id=? AND status=\'normal\' GROUP BY star')
    .all(s.id);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  dist.forEach((d) => { distribution[d.star] = d.c; });

  let my_vote = 0;
  let my_favorite = false;
  if (req.user) {
    const v = db.prepare('SELECT vote FROM stall_votes WHERE stall_id=? AND user_id=?')
      .get(s.id, req.user.id);
    if (v) my_vote = v.vote;
    my_favorite = !!db.prepare('SELECT id FROM favorites WHERE stall_id=? AND user_id=?')
      .get(s.id, req.user.id);
  }

  res.json({ stall: { ...stall, canteen, floor, distribution, my_vote, my_favorite } });
});

// 收藏 / 取消收藏（toggle）
r.post('/:id/favorite', verifyToken, (req, res) => {
  const sid = Number(req.params.id);
  const s = db.prepare('SELECT id FROM stalls WHERE id=?').get(sid);
  if (!s) return res.status(404).json({ error: '窗口不存在' });
  const existing = db.prepare('SELECT id FROM favorites WHERE stall_id=? AND user_id=?')
    .get(sid, req.user.id);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id=?').run(existing.id);
    res.json({ favorite: false });
  } else {
    db.prepare('INSERT INTO favorites (stall_id,user_id) VALUES (?,?)').run(sid, req.user.id);
    res.json({ favorite: true });
  }
});

// 我的收藏
r.get('/my/favorites/list', verifyToken, (req, res) => {
  const rows = db
    .prepare(`SELECT ${STALL_COLS} FROM stalls WHERE id IN
      (SELECT stall_id FROM favorites WHERE user_id=?) AND status='approved'`)
    .all(req.user.id)
    .map((s) => decorateStall(s))
    .sort((a, b) => b.bayes_score - a.bayes_score);
  res.json({ stalls: rows });
});

export default r;
