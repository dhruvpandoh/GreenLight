"use client";

import { FormEvent, useMemo, useState } from "react";
import type {
  ApplicantInput,
  DecisionResult,
  LoanPurpose,
} from "@/lib/decision";

type NumericField = Exclude<keyof ApplicantInput, "loanPurpose">;
type FormState = Record<NumericField, string> & { loanPurpose: LoanPurpose };

const initialForm: FormState = {
  annualIncome: "",
  netWorth: "",
  liquidAssets: "",
  requestedAmount: "",
  monthlyDebtPayments: "",
  creditScore: "",
  loanPurpose: "Liquidity",
};

const presets: Array<{ name: string; values: FormState }> = [
  {
    name: "Strong profile",
    values: {
      annualIncome: "650000",
      netWorth: "6200000",
      liquidAssets: "1800000",
      requestedAmount: "1000000",
      monthlyDebtPayments: "8500",
      creditScore: "782",
      loanPurpose: "Business acquisition",
    },
  },
  {
    name: "Needs review",
    values: {
      annualIncome: "350000",
      netWorth: "2200000",
      liquidAssets: "250000",
      requestedAmount: "850000",
      monthlyDebtPayments: "12500",
      creditScore: "692",
      loanPurpose: "Real estate",
    },
  },
  {
    name: "High risk",
    values: {
      annualIncome: "180000",
      netWorth: "900000",
      liquidAssets: "60000",
      requestedAmount: "700000",
      monthlyDebtPayments: "10500",
      creditScore: "555",
      loanPurpose: "Investment",
    },
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function decisionLabel(decision: DecisionResult["decision"]): string {
  if (decision === "REFER_FOR_REVIEW") return "Refer for review";
  return decision.charAt(0) + decision.slice(1).toLowerCase();
}

function toApplicantInput(form: FormState): ApplicantInput {
  return {
    annualIncome: Number(form.annualIncome),
    netWorth: Number(form.netWorth),
    liquidAssets: Number(form.liquidAssets),
    requestedAmount: Number(form.requestedAmount),
    monthlyDebtPayments: Number(form.monthlyDebtPayments),
    creditScore: Number(form.creditScore),
    loanPurpose: form.loanPurpose,
  };
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedRequest = useMemo(() => {
    const value = Number(form.requestedAmount);
    return Number.isFinite(value) && value > 0 ? currency.format(value) : null;
  }, [form.requestedAmount]);

  function updateNumericField(field: NumericField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setResult(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApplicantInput(form)),
      });

      const data = await response.json();
      if (!response.ok) {
        const details = Array.isArray(data.details)
          ? data.details.join(" ")
          : data.error;
        throw new Error(details || "Unable to evaluate this application.");
      }

      setResult(data as DecisionResult);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong while evaluating the application.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setResult(null);
    setError(null);
  }

  return (
    <main>
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            GP
          </div>
          <div>
            <p className="eyebrow">Gracie Point Holdings</p>
            <p className="brand-name">GreenLight</p>
          </div>
        </div>
        <span className="prototype-pill">Working prototype</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow accent">Preliminary credit decision</p>
          <h1>Move qualified applications forward in seconds.</h1>
          <p className="hero-copy">
            Enter a small set of financial indicators to receive an explainable,
            non-binding preliminary decision.
          </p>
        </div>
        <div className="hero-stat" aria-label="Typical response time">
          <strong>&lt; 1 sec</strong>
          <span>Typical response</span>
        </div>
      </section>

      <section className="workspace">
        <form className="application-card" onSubmit={handleSubmit}>
          <div className="card-heading">
            <div>
              <p className="step-label">Step 1 of 1</p>
              <h2>Applicant financial profile</h2>
            </div>
            {estimatedRequest && (
              <span className="request-chip">Request: {estimatedRequest}</span>
            )}
          </div>

          <div className="preset-row" aria-label="Demo profiles">
            <span>Try a profile:</span>
            {presets.map((preset) => (
              <button
                className="preset-button"
                key={preset.name}
                type="button"
                onClick={() => {
                  setForm(preset.values);
                  setResult(null);
                  setError(null);
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label>
              <span>Annual income</span>
              <small>Gross annual income</small>
              <div className="input-shell">
                <span>$</span>
                <input
                  required
                  min="1"
                  inputMode="decimal"
                  type="number"
                  placeholder="650,000"
                  value={form.annualIncome}
                  onChange={(event) =>
                    updateNumericField("annualIncome", event.target.value)
                  }
                />
              </div>
            </label>

            <label>
              <span>Estimated net worth</span>
              <small>Total assets minus liabilities</small>
              <div className="input-shell">
                <span>$</span>
                <input
                  required
                  min="1"
                  inputMode="decimal"
                  type="number"
                  placeholder="6,200,000"
                  value={form.netWorth}
                  onChange={(event) =>
                    updateNumericField("netWorth", event.target.value)
                  }
                />
              </div>
            </label>

            <label>
              <span>Liquid assets</span>
              <small>Cash and marketable securities</small>
              <div className="input-shell">
                <span>$</span>
                <input
                  required
                  min="0"
                  inputMode="decimal"
                  type="number"
                  placeholder="1,800,000"
                  value={form.liquidAssets}
                  onChange={(event) =>
                    updateNumericField("liquidAssets", event.target.value)
                  }
                />
              </div>
            </label>

            <label>
              <span>Requested loan amount</span>
              <small>Amount requested in this application</small>
              <div className="input-shell">
                <span>$</span>
                <input
                  required
                  min="1"
                  inputMode="decimal"
                  type="number"
                  placeholder="1,000,000"
                  value={form.requestedAmount}
                  onChange={(event) =>
                    updateNumericField("requestedAmount", event.target.value)
                  }
                />
              </div>
            </label>

            <label>
              <span>Monthly debt payments</span>
              <small>Recurring obligations before this loan</small>
              <div className="input-shell">
                <span>$</span>
                <input
                  required
                  min="0"
                  inputMode="decimal"
                  type="number"
                  placeholder="8,500"
                  value={form.monthlyDebtPayments}
                  onChange={(event) =>
                    updateNumericField("monthlyDebtPayments", event.target.value)
                  }
                />
              </div>
            </label>

            <label>
              <span>Credit score</span>
              <small>Consumer score from 300 to 850</small>
              <div className="input-shell no-prefix">
                <input
                  required
                  min="300"
                  max="850"
                  step="1"
                  inputMode="numeric"
                  type="number"
                  placeholder="782"
                  value={form.creditScore}
                  onChange={(event) =>
                    updateNumericField("creditScore", event.target.value)
                  }
                />
              </div>
            </label>

            <label className="full-width">
              <span>Primary loan purpose</span>
              <small>Used for context; not scored in this prototype</small>
              <select
                value={form.loanPurpose}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    loanPurpose: event.target.value as LoanPurpose,
                  }));
                  setResult(null);
                }}
              >
                <option>Business acquisition</option>
                <option>Real estate</option>
                <option>Liquidity</option>
                <option>Investment</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="form-footer">
            <p>
              No applicant data is stored. This prototype is not a final credit
              decision.
            </p>
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={resetForm}>
                Clear
              </button>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Evaluating…" : "Get preliminary decision"}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </div>
        </form>

        <aside className={`decision-card ${result ? "has-result" : ""}`}>
          {!result ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                ✓
              </div>
              <h2>Your decision will appear here</h2>
              <p>
                We evaluate credit strength, debt burden, leverage, and available
                liquidity using transparent rules.
              </p>
              <div className="rule-preview">
                <div>
                  <span>01</span>
                  <p>Validate submitted values</p>
                </div>
                <div>
                  <span>02</span>
                  <p>Calculate three risk ratios</p>
                </div>
                <div>
                  <span>03</span>
                  <p>Return a decision with reasons</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`result result-${result.decision.toLowerCase()}`}>
              <p className="step-label">Preliminary outcome</p>
              <div className="decision-heading">
                <span className="decision-dot" aria-hidden="true" />
                <h2>{decisionLabel(result.decision)}</h2>
              </div>
              <p className="decision-summary">{result.summary}</p>

              <div className="score-block">
                <div className="score-line">
                  <span>Prototype risk score</span>
                  <strong>{result.score}/100</strong>
                </div>
                <div className="score-track">
                  <span style={{ width: `${result.score}%` }} />
                </div>
                <div className="score-thresholds">
                  <span>Decline</span>
                  <span>Review</span>
                  <span>Approve</span>
                </div>
              </div>

              <div className="metric-grid">
                <div>
                  <span>Debt-to-income</span>
                  <strong>{percent.format(result.metrics.debtToIncome)}</strong>
                </div>
                <div>
                  <span>Loan / net worth</span>
                  <strong>{percent.format(result.metrics.loanToNetWorth)}</strong>
                </div>
                <div>
                  <span>Liquidity coverage</span>
                  <strong>{result.metrics.liquidityCoverage.toFixed(2)}×</strong>
                </div>
              </div>

              <div className="explanation-section">
                <h3>Why this result</h3>
                <ul>
                  {result.reasons.map((reason) => (
                    <li key={reason}>
                      <span aria-hidden="true">!</span>
                      {reason}
                    </li>
                  ))}
                  {result.strengths.map((strength) => (
                    <li className="positive" key={strength}>
                      <span aria-hidden="true">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="next-step">
                <strong>Recommended next step</strong>
                <p>
                  {result.decision === "APPROVE" &&
                    "Verify identity, income, assets, and requested-use documents."}
                  {result.decision === "REFER_FOR_REVIEW" &&
                    "Send the application and calculated ratios to a human underwriter."}
                  {result.decision === "DECLINE" &&
                    "Provide an adverse-action review path before any final decision."}
                </p>
              </div>
            </div>
          )}
        </aside>
      </section>

      <footer>
        <span>GreenLight prototype</span>
        <span>Transparent rules · No data persistence · Human review supported</span>
      </footer>
    </main>
  );
}
