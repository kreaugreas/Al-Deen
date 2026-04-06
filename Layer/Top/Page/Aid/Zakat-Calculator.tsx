import { useState } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { Container } from "@/Top/Component/UI/Container";

const NISAB_GOLD_GRAMS = 87.48;
const NISAB_SILVER_GRAMS = 612.36;
const ZAKAT_RATE = 0.025;

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "SAR", symbol: "﷼" },
  { code: "AED", symbol: "د.إ" },
  { code: "MYR", symbol: "RM" },
  { code: "PKR", symbol: "₨" },
  { code: "BDT", symbol: "৳" },
  { code: "IDR", symbol: "Rp" },
  { code: "TRY", symbol: "₺" },
];

const ZakatCalculatorPage = () => {
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  // Nisab prices
  const [goldPricePerGram, setGoldPricePerGram] = useState(70);
  const [silverPricePerGram, setSilverPricePerGram] = useState(0.85);

  // Cash & savings
  const [cash, setCash] = useState(0);
  const [bankSavings, setBankSavings] = useState(0);

  // Gold & silver — entered in grams; value derived from price
  const [goldGrams, setGoldGrams] = useState(0);
  const [silverGrams, setSilverGrams] = useState(0);

  // Investments
  const [stocks, setStocks] = useState(0);
  const [cryptoValue, setCryptoValue] = useState(0);

  // Business
  const [businessInventory, setBusinessInventory] = useState(0);
  const [receivables, setReceivables] = useState(0); // money owed to you

  // Property
  const [rentalIncome, setRentalIncome] = useState(0); // annual rental income only

  // Retirement (accessible portion)
  const [retirementAccessible, setRetirementAccessible] = useState(0);

  // Liabilities
  const [debts, setDebts] = useState(0);
  const [immediateExpenses, setImmediateExpenses] = useState(0); // rent due, bills, etc.

  // Derived
  const goldValue = goldGrams * goldPricePerGram;
  const silverValue = silverGrams * silverPricePerGram;

  const nisabGold = NISAB_GOLD_GRAMS * goldPricePerGram;
  const nisabSilver = NISAB_SILVER_GRAMS * silverPricePerGram;
  const nisab = Math.min(nisabGold, nisabSilver);

  const totalAssets =
    cash +
    bankSavings +
    goldValue +
    silverValue +
    stocks +
    cryptoValue +
    businessInventory +
    receivables +
    rentalIncome +
    retirementAccessible;

  const totalLiabilities = debts + immediateExpenses;
  const netWealth = Math.max(0, totalAssets - totalLiabilities);
  const zakatDue = netWealth >= nisab ? netWealth * ZAKAT_RATE : 0;

  const fmt = (val: number) =>
    `${currency.symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-lg mx-auto space-y-4">

          {/* Currency selector */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Currency</p>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-colors ${
                    currency.code === c.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-black dark:border-white text-muted-foreground"
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </Container>

          {/* Nisab thresholds */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Nisab Threshold Prices</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Gold price / gram ({currency.symbol})
                </label>
                <input
                  type="number"
                  value={goldPricePerGram}
                  onChange={(e) => setGoldPricePerGram(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Silver price / gram ({currency.symbol})
                </label>
                <input
                  type="number"
                  value={silverPricePerGram}
                  onChange={(e) => setSilverPricePerGram(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <p>Gold nisab (87.48g): {fmt(nisabGold)}</p>
              <p>Silver nisab (612.36g): {fmt(nisabSilver)}</p>
              <p className="col-span-2 font-medium text-foreground mt-1">
                Applicable nisab (lower): {fmt(nisab)}
              </p>
            </div>
          </Container>

          {/* Cash & Savings */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Cash & Savings</p>
            <div className="space-y-3">
              {[
                { label: "Cash in Hand", value: cash, setter: setCash },
                { label: "Bank Savings / Current Account", value: bankSavings, setter: setBankSavings },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-sm font-medium block mb-1">{f.label}</label>
                  <input
                    type="number"
                    value={f.value || ""}
                    onChange={(e) => f.setter(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </Container>

          {/* Gold & Silver */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gold & Silver</p>
            <p className="text-xs text-muted-foreground mb-3">
              Enter weight in grams. Value is auto-calculated using prices above.
              <br />
              <span className="text-foreground/60">Note: Gold/silver used for daily personal wear is exempt by many scholars.</span>
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm font-medium block mb-1">Gold (grams)</label>
                <input
                  type="number"
                  value={goldGrams || ""}
                  onChange={(e) => setGoldGrams(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1 pl-1">= {fmt(goldValue)}</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Silver (grams)</label>
                <input
                  type="number"
                  value={silverGrams || ""}
                  onChange={(e) => setSilverGrams(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1 pl-1">= {fmt(silverValue)}</p>
              </div>
            </div>
          </Container>

          {/* Investments */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Investments</p>
            <div className="space-y-3">
              {[
                {
                  label: "Stocks & Shares",
                  sub: "Market value of zakatable portion (exclude fixed assets of company)",
                  value: stocks,
                  setter: setStocks,
                },
                {
                  label: "Cryptocurrency",
                  sub: "Current market value",
                  value: cryptoValue,
                  setter: setCryptoValue,
                },
                {
                  label: "Accessible Retirement / Pension",
                  sub: "Only the portion you can currently withdraw",
                  value: retirementAccessible,
                  setter: setRetirementAccessible,
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-sm font-medium block mb-0.5">{f.label}</label>
                  {f.sub && <p className="text-xs text-muted-foreground mb-1">{f.sub}</p>}
                  <input
                    type="number"
                    value={f.value || ""}
                    onChange={(e) => f.setter(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </Container>

          {/* Business */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Business Assets</p>
            <div className="space-y-3">
              {[
                {
                  label: "Business Inventory",
                  sub: "Value of stock/goods held for sale (not equipment or fixed assets)",
                  value: businessInventory,
                  setter: setBusinessInventory,
                },
                {
                  label: "Receivables (Money Owed to You)",
                  sub: "Amounts you expect to receive — e.g. unpaid invoices, loans given out",
                  value: receivables,
                  setter: setReceivables,
                },
                {
                  label: "Annual Rental Income",
                  sub: "Zakat applies to rental income, not the property value itself",
                  value: rentalIncome,
                  setter: setRentalIncome,
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-sm font-medium block mb-0.5">{f.label}</label>
                  {f.sub && <p className="text-xs text-muted-foreground mb-1">{f.sub}</p>}
                  <input
                    type="number"
                    value={f.value || ""}
                    onChange={(e) => f.setter(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </Container>

          {/* Liabilities */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Liabilities (Deductions)</p>
            <div className="space-y-3">
              {[
                {
                  label: "Debts Owed by You",
                  sub: "Loans, mortgages, credit card balances you owe",
                  value: debts,
                  setter: setDebts,
                },
                {
                  label: "Immediate Expenses Due",
                  sub: "Rent, bills, or payments due within the month",
                  value: immediateExpenses,
                  setter: setImmediateExpenses,
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-sm font-medium block mb-0.5">{f.label}</label>
                  {f.sub && <p className="text-xs text-muted-foreground mb-1">{f.sub}</p>}
                  <input
                    type="number"
                    value={f.value || ""}
                    onChange={(e) => f.setter(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </Container>

          {/* Summary */}
          <Container className="!p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Wealth Summary</p>
            <div className="space-y-1.5 text-sm">
              {[
                { label: "Cash & Savings", value: cash + bankSavings },
                { label: "Gold & Silver", value: goldValue + silverValue },
                { label: "Investments & Crypto", value: stocks + cryptoValue + retirementAccessible },
                { label: "Business Assets", value: businessInventory + receivables + rentalIncome },
                { label: "Total Assets", value: totalAssets, bold: true },
                { label: "Total Liabilities", value: -totalLiabilities, negative: true },
                { label: "Net Zakatable Wealth", value: netWealth, bold: true },
              ].map((row) => (
                <div key={row.label} className={`flex justify-between ${row.bold ? "font-semibold border-t border-border pt-1.5 mt-1.5" : ""}`}>
                  <span className={row.negative ? "text-destructive" : ""}>{row.label}</span>
                  <span className={row.negative ? "text-destructive" : ""}>{fmt(Math.abs(row.value))}</span>
                </div>
              ))}
            </div>
          </Container>

          {/* Result */}
          <Container className={`!p-5 ${zakatDue > 0 ? "border-primary/50 bg-primary/5" : ""}`}>
            <div className="text-center">
              {netWealth >= nisab ? (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Zakat Due (2.5%)</p>
                  <p className="text-4xl font-bold text-primary mb-2">{fmt(zakatDue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Your net wealth of {fmt(netWealth)} exceeds the nisab of {fmt(nisab)}.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold mb-2">No Zakat Due</p>
                  <p className="text-sm text-muted-foreground">
                    Your net wealth of {fmt(netWealth)} is below the nisab threshold of {fmt(nisab)}.
                  </p>
                </>
              )}
            </div>
          </Container>

          {/* Hawl reminder */}
          <Container className="!p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">⚠ Important Conditions</p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-foreground">Hawl (Lunar Year):</strong> Zakat is only obligatory if your wealth
                has remained above the nisab for one complete lunar year.
              </li>
              <li>
                <strong className="text-foreground">Primary home:</strong> Your personal residence is not zakatable.
              </li>
              <li>
                <strong className="text-foreground">Personal vehicle & tools:</strong> Items for personal use or earning
                a livelihood are generally exempt.
              </li>
              <li>
                <strong className="text-foreground">Personal gold/silver:</strong> Scholars differ on jewellery in regular
                use — consult your scholar.
              </li>
              <li>
                <strong className="text-foreground">Disclaimer:</strong> This is an estimate only. Zakat rules vary by
                madhab. Please consult a qualified scholar for your specific situation.
              </li>
            </ul>
          </Container>

        </div>
      </section>
    </Layout>
  );
};

export default ZakatCalculatorPage;