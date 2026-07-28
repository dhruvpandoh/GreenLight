export type Decision = "APPROVE" | "REFER_FOR_REVIEW" | "DECLINE";

export type LoanPurpose =
  | "Business acquisition"
  | "Real estate"
  | "Liquidity"
  | "Investment"
  | "Other";

export interface ApplicantInput {
  annualIncome: number;
  netWorth: number;
  liquidAssets: number;
  requestedAmount: number;
  monthlyDebtPayments: number;
  creditScore: number;
  loanPurpose: LoanPurpose;
}

export interface DecisionMetrics {
  debtToIncome: number;
  loanToNetWorth: number;
  liquidityCoverage: number;
}

export interface DecisionResult {
  decision: Decision;
  score: number;
  summary: string;
  reasons: string[];
  strengths: string[];
  metrics: DecisionMetrics;
  evaluatedAt: string;
}

function creditPoints(score: number): number {
  if (score >= 760) return 35;
  if (score >= 720) return 30;
  if (score >= 680) return 22;
  if (score >= 620) return 12;
  if (score >= 580) return 5;
  return 0;
}

function dtiPoints(dti: number): number {
  if (dti <= 0.25) return 25;
  if (dti <= 0.35) return 21;
  if (dti <= 0.45) return 14;
  if (dti <= 0.55) return 6;
  return 0;
}

function leveragePoints(loanToNetWorth: number): number {
  if (loanToNetWorth <= 0.15) return 25;
  if (loanToNetWorth <= 0.25) return 21;
  if (loanToNetWorth <= 0.4) return 13;
  if (loanToNetWorth <= 0.6) return 5;
  return 0;
}

function liquidityPoints(liquidityCoverage: number): number {
  if (liquidityCoverage >= 1) return 15;
  if (liquidityCoverage >= 0.5) return 12;
  if (liquidityCoverage >= 0.25) return 8;
  if (liquidityCoverage >= 0.1) return 3;
  return 0;
}

export function evaluateApplicant(input: ApplicantInput): DecisionResult {
  const debtToIncome = (input.monthlyDebtPayments * 12) / input.annualIncome;
  const loanToNetWorth = input.requestedAmount / input.netWorth;
  const liquidityCoverage = input.liquidAssets / input.requestedAmount;

  const score = Math.round(
    creditPoints(input.creditScore) +
      dtiPoints(debtToIncome) +
      leveragePoints(loanToNetWorth) +
      liquidityPoints(liquidityCoverage),
  );

  const declineTriggers: string[] = [];
  if (input.creditScore < 580) {
    declineTriggers.push("Credit score is below the preliminary minimum of 580.");
  }
  if (debtToIncome > 0.6) {
    declineTriggers.push("Debt-to-income ratio exceeds the 60% preliminary limit.");
  }
  if (loanToNetWorth > 0.65) {
    declineTriggers.push("Requested amount exceeds 65% of reported net worth.");
  }

  let decision: Decision;
  if (declineTriggers.length > 0 || score < 50) {
    decision = "DECLINE";
  } else if (score >= 75) {
    decision = "APPROVE";
  } else {
    decision = "REFER_FOR_REVIEW";
  }

  const reasons: string[] = [...declineTriggers];
  const strengths: string[] = [];

  if (input.creditScore >= 720) {
    strengths.push(`Strong credit profile (${input.creditScore}).`);
  } else if (input.creditScore < 680) {
    reasons.push(`Credit score of ${input.creditScore} needs additional review.`);
  }

  if (debtToIncome <= 0.35) {
    strengths.push("Existing debt obligations are low relative to annual income.");
  } else if (debtToIncome > 0.45) {
    reasons.push("Existing debt obligations are elevated relative to income.");
  }

  if (loanToNetWorth <= 0.25) {
    strengths.push("Requested loan is modest relative to reported net worth.");
  } else if (loanToNetWorth > 0.4) {
    reasons.push("Requested loan represents a significant share of reported net worth.");
  }

  if (liquidityCoverage >= 0.5) {
    strengths.push("Liquid assets provide meaningful coverage of the requested amount.");
  } else if (liquidityCoverage < 0.25) {
    reasons.push("Liquid assets provide limited coverage of the requested amount.");
  }

  if (reasons.length === 0) {
    reasons.push("No material preliminary risk flags were identified.");
  }

  const summaryByDecision: Record<Decision, string> = {
    APPROVE:
      "Applicant meets the prototype's preliminary approval threshold. Continue to document verification and underwriting.",
    REFER_FOR_REVIEW:
      "The profile is not an automatic decline, but one or more factors require a human underwriter's review.",
    DECLINE:
      "The profile falls outside the prototype's preliminary risk limits based on the information provided.",
  };

  return {
    decision,
    score,
    summary: summaryByDecision[decision],
    reasons: reasons.slice(0, 3),
    strengths: strengths.slice(0, 3),
    metrics: {
      debtToIncome,
      loanToNetWorth,
      liquidityCoverage,
    },
    evaluatedAt: new Date().toISOString(),
  };
}
