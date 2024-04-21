import { Ticker, tickers } from "../jobs/tickers";

export type Strategy = {
  name: string;
  buys: Array<Ticker>;
  sells: Array<Ticker>;
};
export function getStrategy(name: string): Strategy {
  return {
    name: name,
    buys: tickers.slice(0, 100),
    sells: tickers.slice(100, 200),
  };
}

export function getAllStreategies(): Array<Strategy> {
  return [
    getStrategy("14d30dMAC"),
    getStrategy("2m6mMAC"),
    getStrategy("14dMeanReversion"),
  ];
}
