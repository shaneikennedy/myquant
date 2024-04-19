# My Quant

![my quantitative](./myquant.png)

Massive wip, nightly job that runs against the sp500 universe and sends stock picks (buys and sells) to my telegram account.

Eventually I want this to upload analysis to something like s3 and then have a webapp that can fetch "today's" picks and show me charts/analysis and a dashboard.

Starting small, this does basic moving average crossovers but I will add more soon.

To install dependencies:

```bash
bun install
```

To run the analysis:

```bash
bun run src/jobs/index.ts
```

To run the frontend

```bash
bun run dev
```
