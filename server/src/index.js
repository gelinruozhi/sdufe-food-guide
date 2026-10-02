import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { verifyToken } from './auth.js';

import authRoutes from './routes/auth.js';
import canteenRoutes from './routes/canteens.js';
import stallRoutes from './routes/stalls.js';
import reviewRoutes from './routes/reviews.js';
import voteRoutes from './routes/votes.js';
import contributeRoutes from './routes/contribute.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import feedbackRoutes from './routes/feedback.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 上传图片静态访问
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api', reviewRoutes);
app.use('/api', voteRoutes);
app.use('/api/contribute', contributeRoutes);
app.post('/api/reports', verifyToken, (req, res) => {
  const { target_type, target_id, reason } = req.body || {};
  if (!target_type || !target_id || !reason) {
    return res.status(400).json({ error: '举报对象和原因为必填' });
  }
  db.prepare('INSERT INTO reports (target_type,target_id,user_id,reason) VALUES (?,?,?,?)')
    .run(String(target_type).slice(0, 20), Number(target_id), req.user.id, String(reason).slice(0, 200));
  res.json({ ok: true });
});
app.use('/api/stalls', stallRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', uploadRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'sdufe-food-guide' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

// 首次启动且无数据时自动播种
const c = db.prepare('SELECT COUNT(*) c FROM canteens').get().c;
if (c === 0) {
  console.log('数据库为空，正在初始化种子数据…');
  await import('./seed.js');
}

app.listen(PORT, () => {
  console.log(`食在山财后端已启动: http://localhost:${PORT}`);
});
