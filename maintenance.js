// maintenance.js：把設備保養紀錄的 CSV 讀成資料，算出每台機台距離上次保養幾天。
const fs = require('node:fs');

function parseRecords(csv) {
  const [header, ...rows] = csv.trim().split('\n');
  if (!header.startsWith('機台編號')) throw new Error('第一行不是欄位名稱');
  return rows
    .filter((row) => row.trim())
    .map((row) => {
      const [id, site, lastServicedAt] = row.split(',');
      return { id, site, lastServicedAt: lastServicedAt || null };
    });
}

function daysSince(lastServicedAt, today) {
  if (!lastServicedAt) return null;
  const ms = new Date(today) - new Date(lastServicedAt);
  return Math.floor(ms / 86400000);
}

function readRecords(path) {
  return parseRecords(fs.readFileSync(path, 'utf8'));
}

module.exports = { parseRecords, daysSince, readRecords };
