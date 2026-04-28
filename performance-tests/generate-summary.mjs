import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2] || 'performance-tests/report.json';
const outputPath = process.argv[3] || 'performance-tests/report-summary.md';

function fmtNum(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function get(obj, key, fallback = 0) {
  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : fallback;
}

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const report = JSON.parse(raw);
const aggregate = report.aggregate || {};
const counters = aggregate.counters || {};
const rates = aggregate.rates || {};
const summaries = aggregate.summaries || {};

const responseSummary = summaries['http.response_time'] || {};
const sessionSummary = summaries['vusers.session_length'] || {};
const responses = get(counters, 'http.responses', 0);
const requests = get(counters, 'http.requests', 0);
const success2xx = get(counters, 'http.codes.200', 0);
const failures = get(counters, 'vusers.failed', 0);
const usersCompleted = get(counters, 'vusers.completed', 0);
const usersCreated = get(counters, 'vusers.created', 0);
const requestRate = get(rates, 'http.request_rate', 0);

const lines = [
  '# Performance Test Summary',
  '',
  `Source JSON: ${path.normalize(inputPath)}`,
  '',
  '## Traffic Overview',
  '',
  `- Total requests: ${fmtNum(requests)}`,
  `- Total responses: ${fmtNum(responses)}`,
  `- HTTP 200 responses: ${fmtNum(success2xx)}`,
  `- Virtual users created: ${fmtNum(usersCreated)}`,
  `- Virtual users completed: ${fmtNum(usersCompleted)}`,
  `- Virtual users failed: ${fmtNum(failures)}`,
  `- Average request rate: ${fmtNum(requestRate)} req/s`,
  '',
  '## Response Time (ms)',
  '',
  `- Min: ${fmtNum(responseSummary.min)}`,
  `- Mean: ${fmtNum(responseSummary.mean)}`,
  `- Median (p50): ${fmtNum(responseSummary.p50)}`,
  `- P95: ${fmtNum(responseSummary.p95)}`,
  `- P99: ${fmtNum(responseSummary.p99)}`,
  `- Max: ${fmtNum(responseSummary.max)}`,
  '',
  '## Session Length (ms)',
  '',
  `- Min: ${fmtNum(sessionSummary.min)}`,
  `- Mean: ${fmtNum(sessionSummary.mean)}`,
  `- Median (p50): ${fmtNum(sessionSummary.p50)}`,
  `- P95: ${fmtNum(sessionSummary.p95)}`,
  `- P99: ${fmtNum(sessionSummary.p99)}`,
  `- Max: ${fmtNum(sessionSummary.max)}`,
  '',
  '## Quick Interpretation',
  '',
  failures === 0
    ? '- No virtual user failures were observed during this run.'
    : `- ${fmtNum(failures)} virtual user failures were observed during this run.`,
  `- At p95, homepage response time was ${fmtNum(responseSummary.p95)} ms.`,
  ''
];

fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`Summary written to ${outputPath}`);
