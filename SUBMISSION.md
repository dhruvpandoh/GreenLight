# Submission notes

Replace the placeholders below before sending.

- **Live URL:** https://YOUR-PROJECT.vercel.app
- **Repository:** https://github.com/YOUR-USERNAME/greenlight-credit

## 3–5 bullets to send

- I assumed GreenLight is a preliminary triage tool rather than a final lending decision, so every result includes a recommended verification or human-review step.
- I chose credit score, income, existing monthly debt, net worth, liquid assets, and requested amount because they support transparent repayment-capacity, leverage, and liquidity checks without using protected attributes.
- I implemented the decision engine behind a server-side `POST /api/decision` endpoint and return both the outcome and the ratios/reasons that produced it.
- To hit the time box, I omitted persistence, login, external credit/KYC integrations, and a formal audit trail; applicant data is not stored.
- With more time, I would add configurable/versioned underwriting policies, automated unit and end-to-end tests, role-based review queues, and adverse-action/compliance workflows.
