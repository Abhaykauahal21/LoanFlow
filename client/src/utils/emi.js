/**
 * EMI calculation utilities
 *
 * Provides helpers to:
 * - Calculate monthly EMI using the standard formula
 * - Generate an amortization schedule with principal/interest breakdown
 * - Handle leap years and month-end dates when generating payment dates
 * - Adjust the last EMI to handle rounding differences so the loan closes cleanly
 */

// Round a number to 2 decimals reliably (avoid float issues)
export function roundToCents(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

// Return last day of the given year-month
function getLastDayOfMonth(year, month /* 0-indexed */) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Add months to a date while trying to keep the same day of month.
 * If the target month has fewer days, snap to month-end.
 *
 * Example: Jan 31 + 1 month => Feb 29 (leap year) or Feb 28 (non-leap)
 */
export function addMonthsKeepingDay(date, months) {
  const d = new Date(date);
  const origDay = d.getDate();
  const targetMonth = d.getMonth() + months;
  const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = getLastDayOfMonth(targetYear, normalizedMonth);
  const day = Math.min(origDay, lastDay);
  return new Date(targetYear, normalizedMonth, day);
}

/**
 * Get first EMI date: one month after approval date, respecting month-end rules.
 */
export function getFirstEmiDate(approvalDate) {
  return addMonthsKeepingDay(approvalDate, 1);
}

/**
 * Calculate monthly EMI amount using standard formula:
 * EMI = [P × R × (1 + R)^N] / [(1 + R)^N – 1]
 * where:
 * P = principal (loan amount)
 * R = monthly interest rate (annualRate / 12 / 100)
 * N = total number of months
 */
export function calculateEmiAmount(P, annualRatePercent, N) {
  const R = annualRatePercent / 12 / 100;
  if (R === 0) {
    return roundToCents(P / N);
  }
  const pow = Math.pow(1 + R, N);
  const emi = (P * R * pow) / (pow - 1);
  return roundToCents(emi);
}

/**
 * Generate amortization schedule with precise dates, principal/interest break down,
 * cumulative totals, and adjusted last payment to fix rounding differences.
 *
 * Inputs:
 * - loanAmount: number
 * - annualInterestRate: percent (e.g. 12 for 12%)
 * - loanTenureMonths: integer
 * - approvalDate: Date | string (parsable by Date)
 *
 * Returns:
 * {
 *   schedule: Array<{ month, date, principal, interest, balance }>,
 *   emi: number,
 *   totalInterest: number,
 *   totalPayable: number,
 * }
 */
export function generateEmiSchedule({
  loanAmount,
  annualInterestRate,
  loanTenureMonths,
  approvalDate,
}) {
  // Validate inputs
  if (!loanAmount || loanAmount <= 0) {
    throw new Error('Invalid loan amount');
  }
  if (!annualInterestRate || annualInterestRate < 0) {
    throw new Error('Invalid annual interest rate');
  }
  if (!loanTenureMonths || loanTenureMonths <= 0) {
    throw new Error('Invalid loan tenure (months)');
  }

  const N = Math.floor(loanTenureMonths);
  const P = Number(loanAmount);
  const R = annualInterestRate / 12 / 100;
  const emi = calculateEmiAmount(P, annualInterestRate, N);

  let balance = P;
  const schedule = [];
  let totalInterest = 0;

  // First payment date = approval + 1 month
  let paymentDate = getFirstEmiDate(approvalDate);

  for (let i = 1; i <= N; i++) {
    // Interest for the month on current balance
    const interestForMonth = roundToCents(balance * R);
    // Principal portion is EMI - interest
    let principalForMonth = roundToCents(emi - interestForMonth);

    // If this is the last installment, adjust principal to clear remaining balance
    if (i === N) {
      principalForMonth = roundToCents(balance);
      // Adjust EMI to be principal + interest to avoid residuals
      const adjustedEmi = roundToCents(principalForMonth + interestForMonth);
      // Replace emi in the final record only (do not change earlier EMIs)
      schedule.push({
        month: i,
        date: paymentDate.toISOString().split('T')[0],
        principal: principalForMonth,
        interest: interestForMonth,
        balance: roundToCents(balance - principalForMonth),
        emi: adjustedEmi,
      });
      balance = roundToCents(balance - principalForMonth);
      totalInterest = roundToCents(totalInterest + interestForMonth);
      break;
    }

    // Regular months
    const newBalance = roundToCents(balance - principalForMonth);
    schedule.push({
      month: i,
      date: paymentDate.toISOString().split('T')[0],
      principal: principalForMonth,
      interest: interestForMonth,
      balance: newBalance,
      emi,
    });
    balance = newBalance;
    totalInterest = roundToCents(totalInterest + interestForMonth);

    // Next payment date (month increment with month-end handling)
    paymentDate = addMonthsKeepingDay(paymentDate, 1);
  }

  const totalPayable = roundToCents(P + totalInterest);

  return {
    schedule,
    emi,
    totalInterest,
    totalPayable,
  };
}

/**
 * Example usage:
 * const res = generateEmiSchedule({
 *   loanAmount: 100000,
 *   annualInterestRate: 12,
 *   loanTenureMonths: 12,
 *   approvalDate: '2025-11-15',
 * });
 * console.log(res.schedule, res.totalInterest, res.totalPayable);
 */