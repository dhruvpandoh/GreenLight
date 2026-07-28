import { NextResponse } from "next/server";
import {
  ApplicantInput,
  evaluateApplicant,
  LoanPurpose,
} from "@/lib/decision";

const purposes: LoanPurpose[] = [
  "Business acquisition",
  "Real estate",
  "Liquidity",
  "Investment",
  "Other",
];

function isFinitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function validatePayload(payload: unknown):
  | { ok: true; data: ApplicantInput }
  | { ok: false; errors: string[] } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const body = payload as Record<string, unknown>;
  const errors: string[] = [];

  if (!isFinitePositive(body.annualIncome)) {
    errors.push("Annual income must be greater than $0.");
  }
  if (!isFinitePositive(body.netWorth)) {
    errors.push("Net worth must be greater than $0.");
  }
  if (!isFiniteNonNegative(body.liquidAssets)) {
    errors.push("Liquid assets cannot be negative.");
  }
  if (!isFinitePositive(body.requestedAmount)) {
    errors.push("Requested amount must be greater than $0.");
  }
  if (!isFiniteNonNegative(body.monthlyDebtPayments)) {
    errors.push("Monthly debt payments cannot be negative.");
  }
  if (
    typeof body.creditScore !== "number" ||
    !Number.isInteger(body.creditScore) ||
    body.creditScore < 300 ||
    body.creditScore > 850
  ) {
    errors.push("Credit score must be a whole number between 300 and 850.");
  }
  if (!purposes.includes(body.loanPurpose as LoanPurpose)) {
    errors.push("Select a valid loan purpose.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: body as unknown as ApplicantInput };
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    const validation = validatePayload(payload);

    if (!validation.ok) {
      return NextResponse.json(
        { error: "Invalid applicant data.", details: validation.errors },
        { status: 400 },
      );
    }

    const result = evaluateApplicant(validation.data);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to process the request. Check the submitted values." },
      { status: 400 },
    );
  }
}
