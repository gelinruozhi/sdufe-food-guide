import { Router } from 'express';
import { db, decorateStall } from '../db.js';
import { optionalAuth } from '../auth.js';

const r = Router();

const STALL_COLS = `id,stall_type,canteen_id,floor_id,name,category,avg_price,business_hours,
  description,cover,address,phone,delivery_supported,delivery_platform,delivery_fee,min_order,
  source,status,upvotes,downvotes,star_sum,rating_count,created_at`;

// 餐厅列表（含楼层与每层窗口数）
r.get('/', (req, res) => {
  const canteens = db
    .prepare('SELECT * FROM canteens ORDER BY sort')
    .all()
    .map((c) => {
      const floors = db
        .prepare('SELECT * FROM floors WHERE canteen_id=? ORDER BY floor_no')
        .all(c.id)
        .map((f) => ({
          ...f,
          stall_count: db
            .prepare("SELECT COUNT(*) c FROM stalls WHERE floor_id=? AND status='approved'")
            .get(f.id).c,
        }));
      return { ...c, floors };
    });
  res.json({ canteens });
});

// 餐厅详情：楼层 + 各层窗口
r.get('/:id', optionalAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM canteens WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: '餐厅不存在' });

  const floors = db
    .prepare('SELECT * FROM floors WHERE canteen_id=? ORDER BY floor_no')
    .all(c.id)
    .map((f) => {
      const stalls = db
        .prepare(`SELECT ${STALL_COLS} FROM stalls WHERE floor_id=? AND status='approved'`)
        .all(f.id)
        .map((s) => decorateStall(s))
        .sort((a, b) => b.bayes_score - a.bayes_score);
      return { ...f, stalls };
    });
  res.json({ canteen: c, floors });
});

export { STALL_COLS };
export default r;
