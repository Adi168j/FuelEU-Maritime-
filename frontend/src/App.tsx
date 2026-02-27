import { useState } from "react";
import { RoutesTab } from "./adapters/infrastructure/ui/routesttab";
import { CompareTab } from "./adapters/infrastructure/ui/CompareTab";
import { BankingTab } from "./adapters/infrastructure/ui/BankingTab";
import { PoolingTab } from "./adapters/infrastructure/ui/PoolingTab";

type TabKey = "routes" | "compare" | "banking" | "pooling";

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("routes");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold">FuelEU Compliance Dashboard</h1>

        <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("routes")}
            className={`rounded-md px-3 py-1.5 ${
              activeTab === "routes"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Routes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`rounded-md px-3 py-1.5 ${
              activeTab === "compare"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Compare
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("banking")}
            className={`rounded-md px-3 py-1.5 ${
              activeTab === "banking"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Banking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pooling")}
            className={`rounded-md px-3 py-1.5 ${
              activeTab === "pooling"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Pooling
          </button>
        </div>

        {activeTab === "routes" && <RoutesTab />}
        {activeTab === "compare" && <CompareTab />}
        {activeTab === "banking" && <BankingTab />}
        {activeTab === "pooling" && <PoolingTab />}
      </div>
    </div>
  );
}

