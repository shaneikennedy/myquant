import { Strategy } from "../data/strategy";
import React from "react";
import { Ticker } from "../jobs/tickers";

type StrategyCardProps = {
  strategy: Strategy;
};

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy }) => {
  return (
    <div className="col-span-2 bg-white rounded-lg shadow-lg p-6 my-2">
      <h2 className="text-lg font-bold mb-4">{strategy.name}</h2>
      <div className="grid grid-cols-2 gap-4">
        <BuySellCard tickers={strategy.buys} isBuy={true} />
        <BuySellCard tickers={strategy.sells} isBuy={false} />
      </div>
    </div>
  );
};

const BuySellCard = ({
  tickers,
  isBuy,
}: {
  tickers: Array<Ticker>;
  isBuy: boolean;
}) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 max-h-64 overflow-y-scroll">
      <h3 className="text-xl font-bold mb-2">
        {isBuy ? "Buy" : "Sell"} Recommendations
      </h3>
      <ul className="space-y-2">
        {tickers.map((t) => (
          <li className="flex justify-between items-center">
            <div>
              <p className="font-bold">
                {t.name} ({t.symbol})
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
