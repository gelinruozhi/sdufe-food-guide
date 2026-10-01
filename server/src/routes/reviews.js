import { Router } from 'express';
import { db } from '../db.js';
import { verifyToken, optionalAuth } from '../auth.js';

const r = Router();

// 简单敏感词过滤（本地版；生产应替换为微信/第三方内容安全接口）
const BAD_WORDS = ['难吃个屁', '傻逼', '操你', '垃圾去死'];
function sanitize(text) {
  let t = text || '';
  for (const w of BAD_WORDS) t = t.split(w).join('*'.repeat(w.length));
  return t;
}

// 写操作限流：同一用户 20 秒一次
const lastWrite = new Map();
function rateLimited(uid) {
  const now = Date.now();
  const last = lastWrite.get(uid) || 0;
  if (now - last < 20000) return true;
  lastWrite.set(uid, now);
  return false;
}

function parseReview(rv, currentUid) {
  const user = db.prepare('SELECT id,nickname FROM users WHERE id=?').get(rv.user_id);
  const myUseful = currentUid
    ? !!db.prepare('SELECT id FROM review_votes WHERE review_id=? AND user_id=?').get(rv.id, currentUid)
    : false;
  return {
    id: rv.id,
    stall_id: rv.stall_id,
    star: rv.star,
    content: rv.content,
    images: rv.images ? JSON.parse(rv.images) : [],
    anonymous: !!rv.anonymous,
    nickname: rv.anonymous ? '匿名同学' : user ? user.nickname : '已注销用户',
    helpful_count: rv.helpful_count,
    my_useful: myUseful,
    created_at: rv.created_at,
    mine: currentUid === rv.user_id,
  };
}

function recomputeStall(sid) {
  const row = db
    .prepare("SELECT COALESCE(SUM(star),0) AS s, COUNT(*) AS c FROM reviews WHERE stall_id=? AND status='normal'")
    .get(sid);
  db.prepare('UPDATE stalls SET star_sum=?, rating_count=?, updated_at=datetime(\'now\',\'localtime\') WHERE id=?')
    .run(row.s, row.c, sid);
}

// 某窗口的评价列表
r.get('/stalls/:id/reviews', optionalAuth, (req, res) => {
  const sort = req.query.sort === 'helpful'
    ? 'ORDER BY helpful_count DESC, id DESC'
    : 'ORDER BY id DESC';
  const rows = db
    .prepare(`SELECT * FROM reviews WHERE stall_id=? AND status='normal' ${sort}`)
    .all(req.params.id);
  const uid = req.user ? req.user.id : null;
  res.json({ reviews: rows.map((rv) => parseReview(rv, uid)) });
});

// 发表 / 修改评价（upsert）
r.post('/stalls/:id/reviews', verifyToken, (req, res) => {
  const sid = Number(req.params.id);
  const stall = db.prepare("SELECT id FROM stalls WHERE id=? AND status='approved'").get(sid);
  if (!stall) return res.status(404).json({ error: '窗口不存在或已下架' });

  if (rateLimited(req.user.id)) {
    return res.status(429).json({ error: '操作太频繁，请 20 秒后再试' });
  }

  const star = Number(req.body.star);
  if (!Number.isInteger(star) || star < 1 || star > 5) {
    return res.status(400).json({ error: '请选择 1-5 星' });
  }
  let content = sanitize(String(req.body.content || '').trim()).slice(0, 500);
  const images = Array.isArray(req.body.images) ? req.body.images.slice(0, 6) : [];
  const anonymous = req.body.anonymous ? 1 : 0;

  const existing = db
    .prepare('SELECT id FROM reviews WHERE stall_id=? AND user_id=?')
    .get(sid, req.user.id);

  if (existing) {
    db.prepare(`UPDATE reviews SET star=?,content=?,images=?,anonymous=?,
      updated_at=datetime('now','localtime') WHERE id=?`)
      .run(star, content, JSON.stringify(images), anonymous, existing.id);
  } else {
    db.prepare(`INSERT INTO reviews (stall_id,user_id,star,content,images,anonymous)
      VALUES (?,?,?,?,?,?)`)
      .run(sid, req.user.id, star, content, JSON.stringify(images), anonymous);
  }
  recomputeStall(sid);
  res.json({ ok: true });
});

// 评价"有用" toggle
r.post('/reviews/:id/helpful', verifyToken, (req, res) => {
  const rid = Number(req.params.id);
  const rv = db.prepare('SELECT id FROM reviews WHERE id=?').get(rid);
  if (!rv) return res.status(404).json({ error: '评价不存在' });
  const existing = db.prepare('SELECT id FROM review_votes WHERE review_id=? AND user_id=?')
    .get(rid, req.user.id);
  if (existing) {
    db.prepare('DELETE FROM review_votes WHERE id=?').run(existing.id);
    db.prepare('UPDATE reviews SET helpful_count = helpful_count-1 WHERE id=?').run(rid);
    res.json({ helpful: false });
  } else {
    db.prepare('INSERT INTO review_votes (review_id,user_id) VALUES (?,?)').run(rid, req.user.id);
    db.prepare('UPDATE reviews SET helpful_count = helpful_count+1 WHERE id=?').run(rid);
    res.json({ helpful: true });
  }
});

// 我的评价
r.get('/my/reviews/list', verifyToken, (req, res) => {
  const rows = db
    .prepare(`SELECT rv.*, s.name AS stall_name FROM reviews rv
      JOIN stalls s ON s.id=rv.stall_id
      WHERE rv.user_id=? ORDER BY rv.id DESC`)
    .all(req.user.id);
  res.json({
    reviews: rows.map((rv) => ({
      id: rv.id, stall_id: rv.stall_id, stall_name: rv.stall_name,
      star: rv.star, content: rv.content, created_at: rv.created_at,
    })),
  });
});

export default r;
