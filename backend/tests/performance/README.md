# Performance Testing With Artillery

## 1. Start the backend API

From `backend/`:

```bash
npm run dev
```

## 2. Run performance test

In a second terminal from `backend/`:

```bash
npm run test:performance
```

## 3. What this scenario does

- Creates a unique customer account per virtual user
- Logs in immediately after registration
- Exercises both success-path API endpoints under increasing load

## 4. How to tune load

Edit `tests/performance/auth-load.yml`:

- `arrivalRate`: requests/users per second
- `duration`: seconds per phase
- `phases`: warm-up, sustained load, stress burst
- `thresholds`: p95/p99 latency and status code checks

## 5. Optional report output

Use Artillery report generation:

```bash
artillery run tests/performance/auth-load.yml --output artillery-report.json
artillery report artillery-report.json
```
