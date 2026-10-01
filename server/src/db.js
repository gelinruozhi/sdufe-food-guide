import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'food.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  credit_score INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS canteens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  open_hours TEXT,
  sort INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS floors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  canteen_id INTEGER NOT NULL,
  floor_no INTEGER NOT NULL,
  name TEXT,
  FOREIGN KEY (canteen_id) REFERENCES canteens(id)
);

CREATE TABLE IF NOT EXISTS stalls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stall_type TEXT NOT NULL DEFAULT 'inside',
  canteen_id INTEGER,
  floor_id INTEGER,
  name TEXT NOT NULL,
  category TEXT,
  avg_price REAL DEFAULT 0,
  business_hours TEXT,
  description TEXT,
  cover TEXT,
  address TEXT,
  phone TEXT,
  delivery_supported INTEGER DEFAULT 0,
  delivery_platform TEXT,
  delivery_fee REAL,
  min_order REAL,
  source TEXT DEFAULT 'official',
  creator_id INTEGER,
  status TEXT DEFAULT 'approved',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  star_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stall_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  star INTEGER NOT NULL,
  content TEXT,
  images TEXT,
  anonymous INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'normal',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE(stall_id, user_id)
);

CREATE TABLE IF NOT EXISTS stall_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stall_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  vote INTEGER NOT NULL,
  UNIQUE(stall_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  UNIQUE(review_id, user_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stall_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  UNIQUE(stall_id, user_id)
);

CREATE TABLE IF NOT EXISTS corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stall_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  field_name TEXT,
  suggestion TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`);

// 贝叶斯评分参数
export const BAYES_M = 10;

// 全站均分 C
export function globalMean() {
  const row = db
    .prepare("SELECT COALESCE(SUM(star_sum),0) AS s, COALESCE(SUM(rating_count),0) AS c FROM stalls WHERE status='approved' AND rating_count>0")
    .get();
  return row.c > 0 ? row.s / row.c : 3.8;
}

// 为窗口附加评分字段
export function decorateStall(s, C = globalMean()) {
  if (!s) return s;
  const v = s.rating_count || 0;
  const R = v > 0 ? s.star_sum / v : 0;
  const bayes = v > 0 ? (v / (v + BAYES_M)) * R + (BAYES_M / (v + BAYES_M)) * C : C;
  return {
    ...s,
    rating_avg: v > 0 ? Number(R.toFixed(2)) : 0,
    bayes_score: Number(bayes.toFixed(3)),
    delivery_supported: !!s.delivery_supported,
  };
}
