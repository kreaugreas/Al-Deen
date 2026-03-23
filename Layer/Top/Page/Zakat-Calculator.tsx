import { useState } from "react";
import { Layout } from "@/Top/Component/Layout/Layout";
import { Calculator } from "lucide-react";

const NISAB_GOLD_GRAMS = 87.48;
const NISAB_SILVER_GRAMS = 612.36;
const ZAKAT_RATE = 0.025;

const ZakatCalculatorPage = () => {
  const [goldPrice, setGoldPrice] = useState(70); // per gram
  const [silverPrice, setSilverPrice] = useState(0.85); // per gram
  const [cash, setCash] = useState(0);
  const [savings, setSavings] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [goldValue, setGoldValue] = useState(0);
  const [silverValue, setSilverValue] = useState(0);
  const [debts, setDebts] = useState(0);

  const totalWealth = cash + savings + investments + goldValue + silverValue;
  const netWealth = Math.max(0, totalWealth - debts);
  const nisabGold = NISAB_GOLD_GRAMS * goldPrice;
  const nisabSilver = NISAB_SILVER_GRAMS * silverPrice;
  const nisab = Math.min(nisabGold, nisabSilver);
  const zakatDue = netWealth >= nisab ? netWealth * ZAKAT_RATE : 0;

  const fields = [
    { label: "Cash in Hand", value: cash, setter: setCash },
    { label: "Bank Savings", value: savings, setter: setSavings },
    { label: "Investments & Stocks", value: investments, setter: setInvestments },
    { label: "Gold Value", value: goldValue, setter: setGoldValue },
    { label: "Silver Value", value: silverValue, setter: setSilverValue },
    { label: "Debts Owed", value: debts, setter: setDebts },
  ];

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-lg">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Zakat Calculator</h1>
          </div>

          {/* Nisab info */}
          <div className="glass-card !block p-4 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Nisab Threshold</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Gold price/g</label>
                <input
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Silver price/g</label>
                <input
                  type="number"
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Nisab: ${nisab.toFixed(2)} (based on lower of gold/silver)
            </p>
          </div>

          {/* Wealth inputs */}
          <div className="space-y-3 mb-6">
            {fields.map((field) => (
              <div key={field.label} className="glass-card !block p-4">
                <label className="text-sm font-medium mb-2 block">{field.label}</label>
                <input
                  type="number"
                  value={field.value || ""}
                  onChange={(e) => field.setter(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            ))}
          </div>

          {/* Result */}
          <div className={`glass-card !block p-5 ${zakatDue > 0 ? "border-primary/20 bg-primary/5" : ""}`}>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Net Wealth</p>
              <p className="text-xl font-semibold mb-3">${netWealth.toFixed(2)}</p>

              {netWealth >= nisab ? (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Zakat Due (2.5%)</p>
                  <p className="text-3xl font-bold text-primary">${zakatDue.toFixed(2)}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your wealth is below the Nisab threshold. No Zakat is due.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ZakatCalculatorPage;
