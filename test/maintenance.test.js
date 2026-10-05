const test = require('node:test');
const assert = require('node:assert');
const { parseRecords, daysSince, readRecords } = require('../maintenance');

test('parseRecords 會把每一列變成一筆紀錄', () => {
  const records = parseRecords('機台編號,廠區,上次保養日期\nEQ-1001,L5A,2026-09-18');
  assert.deepStrictEqual(records, [{ id: 'EQ-1001', site: 'L5A', lastServicedAt: '2026-09-18' }]);
});

test('沒填上次保養日期的紀錄，日期欄是 null', () => {
  const [record] = parseRecords('機台編號,廠區,上次保養日期\nEQ-1020,L8C,');
  assert.strictEqual(record.lastServicedAt, null);
});

test('daysSince 算得出距離今天幾天', () => {
  assert.strictEqual(daysSince('2026-09-18', '2026-09-30'), 12);
});

test('沒有保養日期就回 null，不是 0', () => {
  assert.strictEqual(daysSince(null, '2026-09-30'), null);
});

test('讀得到範例資料檔', () => {
  const records = readRecords(`${__dirname}/../data/maintenance-2026-09.csv`);
  assert.strictEqual(records.length, 5);
});
