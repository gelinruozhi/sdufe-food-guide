import { Router } from 'express';
import { db } from '../db.js';
import { verifyToken } from '../auth.js';

const r = Router();

// 点赞 / 踩 / 取消
// body: { vote: 1 | -1 | 0 }
r.post('/stalls/:id/vote', verifyToken, (req, res) => {
  const sid = Number(req.params.id);
  const stall = db.prepare('SELECT id FROM stalls WHERE id=?').get(sid);
  if (!stall) return res.status(404).json({ error: '窗口不存在' });

  const vote = Number(req.body.vote);
  if (![1, -1, 0].includes(vote)) {
    return res.status(400).json({ error: 'vote 只能是 1、-1 或 0' });
  }

  const existing = db.prepare('SELECT * FROM stall_votes WHERE stall_id=? AND user_id=?')
    .get(sid, req.user.id);

  if (vote === 0) {
    if (existing) db.prepare('DELETE FROM stall_votes WHERE id=?').run(existing.id);
  } else if (existing) {
    db.prepare('UPDATE stall_votes SET vote=? WHERE id=?').run(vote, existing.id);
  } else {
    db.prepare('INSERT INTO stall_votes (stall_id,user_id,vote) VALUES (?,?,?)')
      .run(sid, req.user.id, vote);
  }

  const counts = db
    .prepare('SELECT COUNT(CASE WHEN vote=1 THEN 1 END) AS up, COUNT(CASE WHEN vote=-1 THEN 1 END) AS down FROM stall_votes WHERE stall_id=?')
    .get(sid);
  db.prepare('UPDATE stalls SET upvotes=?, downvotes=? WHERE id=?')
    .run(counts.up, counts.down, sid);

  res.json({ vote, upvotes: counts.up, downvotes: counts.down });
});

export default r;
