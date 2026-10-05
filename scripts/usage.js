#!/usr/bin/env node
// usage.js：讀 codex exec --json 印出來的 JSONL，把這一輪的 token 數與 credits 算出來。
// 費率抄自 GitHub Copilot 定價頁（美金每百萬 token 乘以 100 換成 credits），查證日期 2026-09-30。

const RATES = {
  'gpt-6-luna': { input: 10, cached: 1, output: 50 },
  'gpt-6-sol': { input: 200, cached: 20, output: 1000 },
  'gpt-6.1-sol': { input: 200, cached: 10, output: 1000 },
  'gpt-6-astra': { input: 1000, cached: 100, output: 5000 },
};

const model = process.argv[2] || 'gpt-6.1-sol';
const rate = RATES[model];
if (!rate) {
  console.error(`不認得這個模型：${model}，可以用的有 ${Object.keys(RATES).join('、')}`);
  process.exit(1);
}

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let usage = null;
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (event.type === 'turn.completed' && event.usage) usage = event.usage;
  }
  if (!usage) {
    console.error('這串輸出裡沒有 turn.completed 事件，確認一下有沒有加 --json');
    process.exit(1);
  }

  const cached = usage.cached_input_tokens ?? 0;
  const fresh = usage.input_tokens - cached; // cached 是 input 的一部分，不重複算
  const output = usage.output_tokens ?? 0;
  const reasoning = usage.reasoning_output_tokens ?? 0; // 算在 output 裡，不另外加
  const credits =
    (fresh * rate.input + cached * rate.cached + output * rate.output) / 1_000_000;

  const pad = (n) => String(n).padStart(9);
  console.log(`模型：${model}`);
  console.log(`  input（沒命中快取）${pad(fresh)}`);
  console.log(`  input（命中快取）  ${pad(cached)}`);
  console.log(`  output             ${pad(output)}`);
  console.log(`  其中推理過程       ${pad(reasoning)}`);
  console.log(`  credits            ${pad(credits.toFixed(4))}`);
});
