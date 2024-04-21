import { StrategyCard } from "./components/card";
import { getAllStreategies } from "./data/strategy";

export default function Home() {
  const today = new Date().toLocaleDateString();
  const strategies = getAllStreategies();
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">My quant</div>
          <nav className="flex space-x-4">
            <a className="hover:text-gray-400" href="#">
              Dashboard
            </a>
            <a className="hover:text-gray-400" href="#">
              {" "}
              Recommendations{" "}
            </a>
          </nav>
        </div>
      </header>
      <div className="flex">
        <div className="mt-6 mx-6 text-right text-lg font-bold">
          Today's Date: {today}
        </div>
      </div>
      <div className="my-2">
        {strategies.map((s) => (
          <StrategyCard strategy={s} />
        ))}
      </div>
    </div>
  );
}
