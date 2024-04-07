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
        t.history.slice(0, 90).reduce((acc, q) => (acc += q.close), 0) /
        (3 * 30),
    },
  }));

const buys = analyses.filter(
  (a) => a.movingAverages.threeMonth > a.movingAverages.sixMonth,
);

const sells = analyses.filter(
  (a) => a.movingAverages.threeMonth <= a.movingAverages.sixMonth,
);

// TODO send this to telegram account
// TODO upload buys and sells to s3

// For now, just log it so we know something happened
console.log(
  buys.map((s) => s.symbol),
  sells.map((s) => s.symbol),
);
