import bcrypt from 'bcryptjs';
import { db } from './db.js';

// 确定性伪随机，保证每次 seed 结果一致
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261001);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ===== 清表（可重复执行）=====
for (const t of [
  'reviews', 'stall_votes', 'review_votes', 'favorites',
  'corrections', 'reports', 'stalls', 'floors', 'canteens', 'users',
]) {
  db.prepare(`DELETE FROM ${t}`).run();
}
db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('reviews','stall_votes','review_votes','favorites','corrections','reports','stalls','floors','canteens','users')").run();

// ===== 用户 =====
const users = [
  ['admin', 'admin123', '根管理员', 'root'],
  ['xiaoming', '123456', '小明爱干饭', 'user'],
  ['foodie', '123456', '山财美食家', 'user'],
  ['ergou', '123456', '二狗', 'user'],
  ['xiaoxue', '123456', '小雪', 'user'],
  ['laowang', '123456', '干饭老王', 'user'],
  ['gantan', '123456', '探店阿坦', 'user'],
  ['meng', '123456', '梦里吃啥', 'user'],
  ['ganfan', '123456', '干饭小能手', 'user'],
  ['tian', '123456', '甜甜', 'user'],
  ['azhe', '123456', '阿哲', 'user'],
  ['mimi', '123456', '咪咪', 'user'],
  ['dachu', '123456', '大厨本厨', 'user'],
  ['xixi', '123456', '西西', 'user'],
  ['pangpang', '123456', '胖胖', 'user'],
];
const insertUser = db.prepare(
  'INSERT INTO users (username,password_hash,nickname,role) VALUES (?,?,?,?)'
);
const userIds = [];
for (const [u, p, n, r] of users) {
  const info = insertUser.run(u, bcrypt.hashSync(p, 10), n, r);
  userIds.push({ id: info.lastInsertRowid, role: r });
}
const normalIds = userIds.filter((u) => u.role === 'user').map((u) => u.id);

// ===== 餐厅与楼层 =====
const canteens = [
  ['第一餐厅', '校园东侧，靠近三号教学楼', '06:30-19:30'],
  ['第二餐厅', '校园中部，图书馆西侧', '06:30-19:30'],
  ['第三餐厅', '校园西侧，靠近学生公寓', '06:30-20:00'],
];
const insertCanteen = db.prepare(
  'INSERT INTO canteens (name,location,open_hours,sort) VALUES (?,?,?,?)'
);
const insertFloor = db.prepare(
  'INSERT INTO floors (canteen_id,floor_no,name) VALUES (?,?,?)'
);
const canteenIds = [];
canteens.forEach((c, i) => {
  const cid = insertCanteen.run(c[0], c[1], c[2], i + 1).lastInsertRowid;
  canteenIds.push(cid);
  insertFloor.run(cid, 1, '一层');
  insertFloor.run(cid, 2, '二层');
});
const floorId = (cid, no) =>
  db.prepare('SELECT id FROM floors WHERE canteen_id=? AND floor_no=?').get(cid, no).id;

// ===== 校内窗口 =====
// [餐厅序号, 楼层, 名称, 品类, 均价, 描述]
const inside = [
  [0,1,'黄焖鸡米饭','焖锅米饭',14,'鸡肉软烂入味，汤汁拌饭一绝，可加豆皮、青菜、金针菇。'],
  [0,1,'川味麻辣烫','麻辣烫',16,'自选菜品按斤称重，麻辣鲜香，提醒：微辣也挺辣。'],
  [0,1,'兰州牛肉拉面','面食',11,'一清二白三红四绿，面条可免费加一量。'],
  [0,1,'家常盖浇饭','盖浇饭',12,'十几种浇头每日轮换，出餐快、分量足。'],
  [0,1,'沂蒙杂粮煎饼','饼类',7,'薄脆现炸，可加肠加里脊，早餐排队王。'],
  [0,2,'麻辣香锅','香锅',20,'荤素自选，干锅撒芝麻，配米饭管饱。'],
  [0,2,'酸菜鱼米饭','鱼类米饭',18,'黑鱼片基本无刺，酸辣开胃。'],
  [0,2,'东北水饺','水饺',13,'手工现包，一两六个，酸菜猪肉经典。'],
  [0,2,'皮蛋瘦肉粥铺','粥点',8,'粥熬得糯，配小菜油条，夜宵时段也开。'],
  [0,2,'烤肉拌饭','盖浇饭',15,'现烤肉切薄片，沙拉酱与孜然双拼。'],
  [1,1,'啵啵鱼','焖锅',17,'无骨龙利鱼配年糕土豆，酱香/番茄/麻辣多口味。'],
  [1,1,'过桥米线','米线',14,'汤头滚烫、配料丰富，微辣鲜美。'],
  [1,1,'自选称重餐厅','自助餐',12,'几十种菜品自选称重，减脂人群友好。'],
  [1,1,'山西刀削面','面食',11,'面叶筋道，西红柿鸡蛋卤最经典。'],
  [1,1,'炸串拌饭','炸串',15,'现炸刷酱配米饭，甜辣口，解馋。'],
  [1,2,'石锅拌饭','韩餐',15,'锅巴香脆，溏心蛋拌开，送例汤。'],
  [1,2,'沙县小吃','小吃',12,'蒸饺、飘香拌面、炖罐，出餐极快。'],
  [1,2,'铁板厨房','铁板饭',16,'铁板牛排饭滋滋作响，黑椒汁浓郁。'],
  [1,2,'淮南牛肉汤','汤类',13,'汤浓肉多，粉丝豆饼，配烧饼。'],
  [1,2,'轻食沙拉','轻食',18,'鸡胸肉藜麦时蔬配油醋汁，健身窗口。'],
  [2,1,'隆江猪脚饭','卤味饭',16,'猪脚卤得软糯，肥而不腻，浇卤汁。'],
  [2,1,'锡纸花甲粉','粉类',14,'锡纸现烤，花甲新鲜，蒜香十足。'],
  [2,1,'包子粥铺','早餐',6,'鲜肉包、香菇青菜包，早餐快捷之选。'],
  [2,1,'土耳其烤肉饭','盖浇饭',14,'旋转烤肉削片，辣味酱汁提味。'],
  [2,1,'胡辣汤水煎包','早餐',7,'河南风味，胡辣汤料足，水煎包底脆。'],
  [2,2,'日式蛋包饭','日式米饭',15,'蛋皮嫩滑，咖喱/番茄两种酱可选。'],
  [2,2,'重庆小面','面食',12,'豌杂干拌面，豌泥裹面，麻辣够味。'],
  [2,2,'卤味拼盘饭','卤味饭',15,'卤鸡腿、卤蛋、豆干，卤汁拌饭。'],
  [2,2,'芝士焗饭','西餐',18,'芝士拉丝，咖喱牛肉焗饭最热门。'],
  [2,2,'馄饨世家','馄饨',10,'大馅馄饨汤清，紫菜虾皮提鲜。'],
];

// ===== 校外店铺 =====
// [名称, 品类, 均价, 描述, 地址, 电话, 外卖, 平台, 配送费, 起送]
const outside = [
  ['巷子里炭火烤肉','烤肉',65,'学生聚餐据点，双人套餐划算，生菜免费续。','学府路小吃街12号','13800001111',0,'',0,0],
  ['阿婆炒鸡','炒鸡',38,'临沂炒鸡大盘上桌，配饼蘸汤，三四人吃刚好。','学府路小吃街06号','13800002222',1,'美团',3,30],
  ['碗里香螺蛳粉','粉面',14,'臭味相投，炸蛋必加，汤都喝完。','学府路小吃街21号','13800003333',1,'美团/饿了么',3,20],
  ['一间轻食','轻食',22,'低卡餐外卖，糙米鸡胸，健身党常点。','文化东路88号','13800004444',1,'美团',2,25],
  ['川香小厨','川菜',25,'水煮肉片、回锅肉现炒，特别下饭。','文化东路102号','13800005555',1,'美团/饿了么',3,30],
  ['夜市铁板鱿鱼','夜市小吃',12,'出摊较晚，鱿鱼须脆嫩，刷甜辣酱。','西门夜市摊区','',0,'',0,0],
  ['鲜果切水果捞','甜品',15,'现切应季水果，酸奶水果捞清爽。','西门商业街3号','13800006666',1,'饿了么',2,18],
  ['老济南黄焖鸡','米饭',16,'开了多年，鸡腿肉大块，外卖送达快。','西门商业街9号','13800007777',1,'美团/饿了么',2,20],
];

const insertStall = db.prepare(`
  INSERT INTO stalls (stall_type,canteen_id,floor_id,name,category,avg_price,business_hours,
    description,address,phone,delivery_supported,delivery_platform,delivery_fee,min_order,source,status)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);
const mealHours = '10:30-13:00, 16:30-19:00';
const breakfastHours = '06:30-09:30, 10:30-13:00, 16:30-19:00';
const stallIds = [];

for (const [ci, fl, name, cat, price, desc] of inside) {
  const cid = canteenIds[ci];
  const fid = floorId(cid, fl);
  const hours = ['饼类','早餐','粥点'].includes(cat) ? breakfastHours : mealHours;
  const info = insertStall.run(
    'inside', cid, fid, name, cat, price, hours, desc,
    null, null, 0, null, null, null, 'official', 'approved'
  );
  stallIds.push(info.lastInsertRowid);
}
for (const [name,cat,price,desc,addr,phone,dl,plat,fee,minO] of outside) {
  const info = insertStall.run(
    'outside', null, null, name, cat, price, '10:00-21:30', desc,
    addr, phone, dl, plat || null, fee || null, minO || null, 'official', 'approved'
  );
  stallIds.push(info.lastInsertRowid);
}

// ===== 评价语料 =====
const corpus = {
  5: [
    '真的太好吃了，连吃三天都不腻，强烈推荐！','分量很足，味道正宗，阿姨手不抖，性价比拉满。',
    '我心中的食堂天花板，排队也值得。','出餐快、味道稳、食材新鲜，闭眼冲。',
    '汤汁拌饭绝了，吃完还想再来一碗。','价格实惠量又大，男生也能吃饱，非常满意。',
    '阿姨特别热情，味道也一直在线。','这个价位吃到这个品质，没什么可挑的。',
    '室友被我安利后也成了常客，公认好吃。','肉给得很实在，不是全靠配菜凑，好评。',
    '口味很地道，和在家乡吃的一个味。','窗口收拾得干净，吃得放心。',
    '微辣刚刚好，香味很足，吃完嘴里留香。','菜单经常更新，吃不腻，看得出用心。',
    '高峰排队但移动很快，值得等。','整体五星，希望一直保持这个水准。',
  ],
  4: [
    '味道不错，就是高峰期排队有点久。','整体满意，肉再多一点就完美了。',
    '好吃但略咸，配米饭刚好，会回购。','分量可以，价格小涨，四星观望。',
    '口味稳定，偶尔发挥失常，总体推荐。','出餐挺快，座位不好找，建议打包。',
    '味道在线，窗口有点不起眼，容易错过。','中规中矩的好吃，没惊喜但不踩雷。',
    '四星，辣度偏辣，不能吃辣慎点。','菜量足，就是有点油，香还是香的。',
    '等餐十分钟左右，能接受。','性价比不错，希望别再涨价。',
  ],
  3: [
    '味道一般，能吃饱，谈不上好吃。','时好时坏，全看当天师傅发挥。',
    '分量偏少，男生可能得加份饭。','普普通通，没记忆点，应急可以。',
    '价格还行，味道偏淡，得自己加调料。','排队久、出餐慢，味道也就那样。',
    '种类少，吃几次就腻了。','三星不吹不黑，不如隔壁窗口。',
    '油偏大，吃完有点腻，偶尔吃行。','没网传的那么神，期望别太高。',
  ],
  2: [
    '味道不行，肉柴得咬不动，不推荐。','等了二十分钟，结果又贵又难吃。',
    '菜品不太新鲜，吃完肚子不舒服。','分量越来越少、价格越来越高，失望。',
    '太咸了，感觉在吃盐，不会再去。','阿姨手抖得厉害，肉就两块，离谱。',
    '餐盘还有油渍，卫生堪忧。','踩雷了，大家谨慎选择。',
  ],
  1: [
    '吃过最难吃的窗口，没有之一，避雷。','吃完拉肚子，食材明显有问题。',
    '又贵又少又难吃，态度还差。','排队半小时，吃到嘴里是凉的。',
    '不明白好评哪来的，严重怀疑刷分。','直接倒掉了，浪费钱，再也不会去。',
  ],
};
function randomStar() {
  const r = rand();
  if (r < 0.45) return 5;
  if (r < 0.75) return 4;
  if (r < 0.9) return 3;
  if (r < 0.97) return 2;
  return 1;
}

const insertReview = db.prepare(`
  INSERT INTO reviews (stall_id,user_id,star,content,anonymous,created_at)
  VALUES (?,?,?,?,?,datetime('now',?))
`);

for (const sid of stallIds) {
  const n = 3 + Math.floor(rand() * 10); // 3-12 条
  const shuffled = [...normalIds].sort(() => rand() - 0.5).slice(0, n);
  let sum = 0;
  for (const uid of shuffled) {
    const star = randomStar();
    const content = pick(corpus[star]);
    const anon = rand() < 0.15 ? 1 : 0;
    const days = -Math.floor(rand() * 60);
    insertReview.run(sid, uid, star, content, anon, `${days} days`);
    sum += star;
  }
  db.prepare('UPDATE stalls SET star_sum=?, rating_count=? WHERE id=?').run(
    sum, shuffled.length, sid
  );
}

// 少量赞踩
const insertVote = db.prepare('INSERT OR IGNORE INTO stall_votes (stall_id,user_id,vote) VALUES (?,?,?)');
for (const sid of stallIds) {
  for (const uid of normalIds) {
    if (rand() < 0.18) insertVote.run(sid, uid, rand() < 0.85 ? 1 : -1);
  }
}
db.prepare(`
  UPDATE stalls SET
    upvotes = (SELECT COUNT(*) FROM stall_votes WHERE stall_id=stalls.id AND vote=1),
    downvotes = (SELECT COUNT(*) FROM stall_votes WHERE stall_id=stalls.id AND vote=-1)
`).run();

console.log('种子数据完成：');
console.log(`  用户 ${users.length}（管理员 admin/admin123，普通用户密码均为 123456）`);
console.log(`  餐厅 ${canteens.length} × 楼层 2`);
console.log(`  窗口 ${inside.length} 校内 + ${outside.length} 校外`);
console.log(`  评价 ${db.prepare('SELECT COUNT(*) c FROM reviews').get().c} 条`);
