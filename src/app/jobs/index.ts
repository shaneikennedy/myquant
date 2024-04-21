import yahooFinance from "yahoo-finance2";
import { tickers } from "./tickers";

function sixMonthsAgo(): Date {
  let d = new Date(0);
  d.setUTCMilliseconds(Date.now() - 15_552_000_000); // 6m * 30 d/m *24hr/d * 60m/hr * 60s/m
  return d;
}

type Quote = {
  date: Date;
  close: number; // Actually the adjustedClose
};

type StockHistory = {
  symbol: string;
  history: Array<Quote>;
};

type UniverseHistory = {
  histories: Array<StockHistory>;
};

// Only for local dev so y*hoo finance doesn't hit me with their bitch-ass rate limit
const cacheFile = Bun.file("cache.json");

let universe: UniverseHistory;
if (cacheFile.size > 0) {
  universe = await cacheFile.json();
} else {
  universe = {
    histories: await Promise.all(
      tickers.map(async (t) => {
        try {
          const response = await yahooFinance.historical(t.symbol, {
            period1: sixMonthsAgo(),
            interval: "1d",
          });
          return {
            symbol: t.symbol,
            history: response.map((q) => ({
              date: q.date,
              close: q.adjClose!,
            })),
          };
        } catch (e) {
          console.error(`Could not fetch history for ${t.symbol}`);
          return { symbol: "unfetched", history: [] };
        }
      }),
    ),
  };
  Bun.write(cacheFile, JSON.stringify(universe));
}

type MovingAverages = {
  threeMonth: number;
  sixMonth: number;
  fourteenDay: number;
  oneMonth: number;
};

type StockAnalysis = {
  symbol: string;
  history: Array<Quote>;
  movingAverages: MovingAverages;
};

const analyses: Array<StockAnalysis> = universe.histories
  .filter((t) => t.history.length > 0) // Get rid of anything that we couldn't fetch a history for
  .map((t) => ({
    ...t,
    movingAverages: {
      sixMonth: t.history.reduce((acc, q) => (acc += q.close), 0) / (6 * 30),
      threeMonth:
        t.history
          .slice(t.history.length - 90, t.history.length)
          .reduce((acc, q) => (acc += q.close), 0) /
        (3 * 30),
      fourteenDay:
        t.history
          .slice(t.history.length - 14, t.history.length)
          .reduce((acc, q) => acc + q.close, 0) / 14,
      oneMonth:
        t.history
          .slice(t.history.length - 30, t.history.length)
          .reduce((acc, q) => acc + q.close, 0) / 30,
    },
  }));

const buys = analyses.filter((a) => {
  return (
    a.movingAverages.threeMonth > a.movingAverages.sixMonth ||
    a.movingAverages.fourteenDay > a.movingAverages.oneMonth
  );
});

const sells = analyses.filter((a) => {
  return (
    a.movingAverages.threeMonth <= a.movingAverages.sixMonth ||
    a.movingAverages.fourteenDay <= a.movingAverages.oneMonth
  );
});

const conflicts = sells.filter((q) => buys.find((b) => b.symbol === q.symbol));

// TODO send this to telegram account
// TODO upload buys and sells to s3

const summary = {
  buys: buys.map((s) => s.symbol),
  numToBuy: buys.length,
  sells: sells.map((s) => s.symbol),
  numToSell: sells.length,
  conflicts: conflicts.map((s) => s.symbol),
  numConflicts: conflicts.length,
};

console.log(summary);
