# Performance Test Commands

Use this folder for local load testing against the deployed target.

## Prerequisite

Artillery 2.0.31 requires Node 22 or newer.

```bash
nvm use 22
```

## Run Test

```bash
artillery run test.yml
```

## Save JSON Output

```bash
artillery run --output performance-tests/report.json performance-tests/test.yml
```

## Generate Local Summary Report

```bash
npm run perf:summary
```

This creates:

- performance-tests/report-summary.md

## Note about HTML Report

In current Artillery versions, the `artillery report` command is deprecated and no longer generates local HTML output.
