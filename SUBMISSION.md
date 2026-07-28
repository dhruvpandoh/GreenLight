# Submission notes

- **Live URL:** https://green-light-credit.vercel.app/
- **Repository:** https://github.com/dhruvpandoh/GreenLight

## Assumptions, Tradeoffs, and Next Steps

- I treated GreenLight as an initial screening tool, not a replacement for a real underwriter. That’s why every decision includes a clear explanation and a suggested next step, such as verification or manual review.
- I focused on a small set of inputs that are easy to understand and directly related to financial risk: credit score, income, monthly debt, net worth, liquid assets, and requested loan amount. These let the system evaluate repayment ability, leverage, and liquidity without using protected personal characteristics.
- I kept the decision logic on the server behind a `POST /api/decision` endpoint. The API returns the decision along with the key ratios and reasons behind it, so the result is transparent rather than a black box.
- Because this was a time-boxed prototype, I left out features such as authentication, data storage, external credit or KYC integrations, and a full audit trail. Applicant information is evaluated in real time and is not saved.
- With more time, I would add configurable and versioned underwriting rules, automated unit and end-to-end tests, a review queue for underwriters, and stronger compliance and adverse-action workflows.
