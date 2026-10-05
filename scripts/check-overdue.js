#!/usr/bin/env node
// check-overdue.js：檢查 maintenance.js 裡新加的逾期函式。
// 用法：node scripts/check-overdue.js 90
// 會找出 maintenance.js 匯出的函式中，名稱含有 overdue 的那一個，以 2026-09-30 為今天執行。
const path = require('node:path');
const m = require(path.join(__dirname, '..', 'maintenance'));

const days = Number(process.argv[2] || 90);
const name = Object.keys(m).find((key) => /overdue/i.test(key) && typeof m[key] === 'function');
if (!name) {
  console.error('maintenance.js 沒有匯出名稱含有 overdue 的函式');
  process.exit(1);
}
const records = m.readRecords(path.join(__dirname, '..', 'data', 'maintenance-2026-09.csv'));
const result = m[name](records, '2026-09-30', days).map((item) => item.id || item);
console.log(`${name}(..., ${days} 天)：${result.join('、') || '沒有'}`);
