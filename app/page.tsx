"use client";

import { useMemo, useState } from "react";
import { accountSizes, propFirms, type PropFirm } from "@/lib/propfirms";

type FirmRow = {
  firm: PropFirm;
  accountSize: number;
  fee: number | null;
  feePer10k: number | null;
  payoutSplit?: string;
  drawdown?: string;
  profitTarget?: string;
  evaluationPhases?: number;
  minTradingDays?: number;
};

const formatCurrency = (value: number | null) =>
  value === null ? "—" : `$${value.toLocaleString()}`;

const formatFeePer10k = (value: number | null) =>
  value === null ? "—" : `$${value.toFixed(2)}`;

const toFirmRows = (size: number): FirmRow[] =>
  propFirms.map((firm) => {
    const account = firm.accounts.find((item) => item.size === size);
    if (!account) {
      return {
        firm,
        accountSize: size,
        fee: null,
        feePer10k: null
      };
    }

    const feePer10k = (account.fee / account.size) * 10000;

    return {
      firm,
      accountSize: size,
      fee: account.fee,
      feePer10k,
      payoutSplit: account.payoutSplit,
      drawdown: account.maxDrawdown,
      profitTarget: account.profitTarget,
      evaluationPhases: account.evaluationPhases,
      minTradingDays: account.minTradingDays
    };
  });

export default function Page() {
  const [selectedSize, setSelectedSize] = useState<number>(10000);

  const rows = useMemo(() => toFirmRows(selectedSize), [selectedSize]);
  const { cheapestFee, nextBestFee } = useMemo(() => {
    const available = rows
      .filter((row) => row.fee !== null)
      .map((row) => row.fee as number)
      .sort((a, b) => a - b);

    return {
      cheapestFee: available[0] ?? null,
      nextBestFee: available[1] ?? null
    };
  }, [rows]);

  return (
    <main>
      <section className="hero">
        <div className="badge">Live 2024 data snapshot</div>
        <h1>Find the Cheapest Forex Prop Firm for Your Account Size</h1>
        <p>
          Compare evaluation fees, payout splits, and risk rules from vetted
          proprietary trading firms. Select an account size to highlight the
          cheapest funding option and understand the trade-offs behind low-cost
          challenges.
        </p>
      </section>

      <section className="grid" style={{ marginBottom: "2.5rem" }}>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Account Size</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Choose the funded account size you are targeting. Fees and rankings
            update instantly.
          </p>
          <div className="pill-group" role="tablist" aria-label="Account size">
            {accountSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`pill ${selectedSize === size ? "active" : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                ${size.toLocaleString()}
              </button>
            ))}
          </div>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>How to use this table</h2>
          <ul className="note-list">
            <li>
              <strong>Cheapest</strong> firms toggle automatically per account
              size. Only firms with recent reputation checks are included.
            </li>
            <li>
              <strong>Fee per 10k</strong> normalizes evaluation cost so you can
              compare small vs. large challenges fairly.
            </li>
            <li>
              <strong>Risk rules</strong> summarize key limits that often matter
              more than the sticker price. Hover over firms to learn more.
            </li>
          </ul>
        </article>
      </section>

      <section className="card" style={{ marginBottom: "2.5rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0 }}>Challenge Pricing Comparison</h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "1rem"
              }}
            >
              Sorted by upfront evaluation fee for a $
              {selectedSize.toLocaleString()} account.
            </p>
          </div>
        </header>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Firm</th>
                <th scope="col">Upfront Fee</th>
                <th scope="col">Fee / $10k</th>
                <th scope="col">Payout Split</th>
                <th scope="col">Drawdown Rules</th>
                <th scope="col">Profit Target</th>
                <th scope="col">Min Days</th>
                <th scope="col">Phases</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .slice()
                .sort((a, b) => {
                  if (a.fee === null) return 1;
                  if (b.fee === null) return -1;
                  return a.fee - b.fee;
                })
                .map((row) => {
                  const isCheapest =
                    cheapestFee !== null && row.fee === cheapestFee;
                  return (
                    <tr key={row.firm.name}>
                      <td>
                        <div style={{ display: "grid", gap: "0.35rem" }}>
                          <div style={{ display: "flex", gap: "0.65rem" }}>
                            <strong>{row.firm.name}</strong>
                            {isCheapest ? (
                              <span className="badge">Cheapest</span>
                            ) : null}
                          </div>
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.9rem"
                            }}
                          >
                            {row.firm.tagline}
                          </span>
                          <a
                            href={row.firm.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "var(--accent)",
                              fontWeight: 600,
                              fontSize: "0.85rem"
                            }}
                          >
                            Visit site →
                          </a>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "grid", gap: "0.35rem" }}>
                          <span style={{ fontWeight: 600 }}>
                            {formatCurrency(row.fee)}
                          </span>
                          {isCheapest &&
                          row.fee !== null &&
                          nextBestFee !== null ? (
                            <span
                              className="status positive"
                              aria-label="Lowest fee for selection"
                            >
                              Save $
                              {Math.max(0, nextBestFee - row.fee).toFixed(0)}{" "}
                              vs. next option
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>{formatFeePer10k(row.feePer10k)}</td>
                      <td>{row.payoutSplit ?? "—"}</td>
                      <td>{row.drawdown ?? "—"}</td>
                      <td>{row.profitTarget ?? "—"}</td>
                      <td>
                        {row.minTradingDays !== undefined
                          ? `${row.minTradingDays} days`
                          : "—"}
                      </td>
                      <td>
                        {row.evaluationPhases !== undefined
                          ? `${row.evaluationPhases}-step`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <h2 style={{ marginTop: 0 }}>Quick scorecard</h2>
          <div className="legend" style={{ marginBottom: "0.85rem" }}>
            <span>
              <span
                className="legend-dot"
                style={{ background: "var(--success)" }}
              />
              Strength
            </span>
            <span>
              <span
                className="legend-dot"
                style={{ background: "var(--danger)" }}
              />
              Caution
            </span>
          </div>
          <div className="grid">
            {propFirms.map((firm) => (
              <div
                key={firm.name}
                className="card"
                style={{
                  border: "1px dashed var(--border)",
                  boxShadow: "none",
                  background: "rgba(248,250,252,0.6)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{firm.name}</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    Est. {firm.founded} • {firm.headquartered}
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)" }}>{firm.tagline}</p>
                <div
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    marginTop: "1rem"
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.85rem" }}>Strengths</strong>
                    <ul className="note-list">
                      {firm.strengths.map((item) => (
                        <li
                          key={item}
                          style={{ color: "var(--success)", fontWeight: 500 }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.85rem" }}>Watch-outs</strong>
                    <ul className="note-list">
                      {firm.cautions.map((item) => (
                        <li
                          key={item}
                          style={{ color: "var(--danger)", fontWeight: 500 }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Due diligence checklist</h2>
          <ul className="note-list">
            <li>
              Confirm funding terms within the last week. Prop firm policies
              change rapidly; verify on the official site before purchasing.
            </li>
            <li>
              Read customer payout reviews on communities such as{" "}
              <a
                href="https://www.trustpilot.com"
                target="_blank"
                rel="noreferrer"
              >
                Trustpilot
              </a>{" "}
              and{" "}
              <a
                href="https://www.forexfactory.com/"
                target="_blank"
                rel="noreferrer"
              >
                Forex Factory
              </a>{" "}
              for the latest experiences.
            </li>
            <li>
              Match risk rules to your strategy. Low fees with trailing drawdown
              or strict daily loss limits may be harder to manage.
            </li>
            <li>
              Use demo accounts to stress-test your strategy under the exact
              rules before attempting a paid evaluation.
            </li>
          </ul>

          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ marginTop: 0 }}>Key evaluation types</h3>
            <ul className="note-list">
              <li>
                <strong>One-step challenge:</strong> Pay higher fee for faster
                access; typically higher targets and tighter drawdown.
              </li>
              <li>
                <strong>Two-step challenge:</strong> Lower target per phase but
                requires consistency over two evaluation accounts.
              </li>
              <li>
                <strong>Instant funding:</strong> Pay a high upfront fee for a
                live account, usually with smaller profit splits and trailing
                drawdown.
              </li>
            </ul>
          </div>
        </article>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <p className="disclaimer">
          Disclaimer: Prop firm availability, pricing, and rules change
          frequently. The above data reflects the cheapest publicly advertised
          pricing as of Q1 2024 and remains for informational purposes only. We
          do not endorse any firm nor guarantee funding outcomes. Always confirm
          all terms directly with the provider and consult with a financial
          professional before risking capital.
        </p>
      </section>
    </main>
  );
}
