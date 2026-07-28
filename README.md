# GreenLight — Preliminary Credit Decision Prototype

A small full-stack web application for Gracie Point Holdings. A user enters a loan applicant's core financial indicators and receives an immediate, explainable preliminary result: **Approve**, **Refer for Review**, or **Decline**.

## Live-product behavior

- Responsive React/Next.js form with accessible native controls.
- `POST /api/decision` server endpoint for validation and decisioning.
- Deterministic, transparent scoring rather than a black-box model.
- Three demo profiles so a reviewer can test every outcome quickly.
- No persistence of applicant information.

## Decision model

The prototype calculates:

1. **Debt-to-income** = annualized existing debt payments / annual income
2. **Loan-to-net-worth** = requested loan / net worth
3. **Liquidity coverage** = liquid assets / requested loan

It then combines those ratios with the submitted credit score into a 100-point score. Hard limits apply for very low credit, debt-to-income above 60%, or a request above 65% of net worth.

This is intentionally a preliminary eligibility screen, not a final lending decision.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Before submitting:

```bash
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, choose **Add New → Project**.
3. Import the GitHub repository.
4. Keep the detected Next.js settings and click **Deploy**.

No environment variables are required.

## Assumptions and tradeoffs

- I treated GreenLight as a preliminary triage tool; final approval still requires identity, income, asset, and document verification.
- I selected inputs that are directly tied to repayment capacity and avoided protected-class attributes.
- I used an explainable deterministic score so an underwriter can understand every result.
- To meet the time box, I did not add authentication, a database, third-party credit verification, or a full audit trail.
- Next steps would be configurable underwriting rules, versioned decisions, role-based access, adverse-action workflows, automated tests, and integrations with KYC/credit/data providers.
