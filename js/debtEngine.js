/**
 * =========================================================
 * SplitSathi — Debt Simplification Engine
 * Minimum Cash Flow Algorithm (Greedy Graph Simplification)
 * =========================================================
 */

/**
 * Calculates net balance for every member.
 * Net Balance = Total Paid - Total Fair Share + Net Settlements
 * Positive balance: Owed money by group (Creditor)
 * Negative balance: Owes money to group (Debtor)
 * Zero balance: Settled up
 */
export function calculateNetBalances(members, expenses, settlements = []) {
  const balances = {};
  
  // Initialize each member with 0 balance
  members.forEach(m => {
    balances[m.id] = 0;
  });

  // Process Expenses
  expenses.forEach(expense => {
    const payerId = expense.paidBy;
    const amount = Number(expense.amount) || 0;

    // Credit the payer for paying the full expense upfront
    if (balances[payerId] !== undefined) {
      balances[payerId] += amount;
    }

    // Debit each participant for their share
    if (expense.splits && Array.isArray(expense.splits)) {
      expense.splits.forEach(split => {
        if (balances[split.memberId] !== undefined) {
          balances[split.memberId] -= Number(split.amount) || 0;
        }
      });
    }
  });

  // Process Direct Settlements
  settlements.forEach(s => {
    const fromId = s.from;
    const toId = s.to;
    const amount = Number(s.amount) || 0;

    // Debtor paid creditor -> Debtor balance increases (reduces negative balance)
    if (balances[fromId] !== undefined) {
      balances[fromId] += amount;
    }
    // Creditor received payment -> Creditor balance decreases (reduces positive balance)
    if (balances[toId] !== undefined) {
      balances[toId] -= amount;
    }
  });

  // Round all balances to 2 decimal places to eliminate floating point issues
  Object.keys(balances).forEach(id => {
    balances[id] = Math.round(balances[id] * 100) / 100;
  });

  return balances;
}

/**
 * Calculates raw (unsimplified) pairwise debts directly from expense items.
 * Each expense creates direct debts from participants to the payer.
 */
export function calculateRawDebts(members, expenses, settlements = []) {
  // Map of pairwise debt: debtsMap[debtorId][creditorId] = amount
  const debtMatrix = {};

  members.forEach(m1 => {
    debtMatrix[m1.id] = {};
    members.forEach(m2 => {
      debtMatrix[m1.id][m2.id] = 0;
    });
  });

  // 1. Add debts from expenses
  expenses.forEach(expense => {
    const payerId = expense.paidBy;
    if (!expense.splits) return;

    expense.splits.forEach(split => {
      if (split.memberId !== payerId && split.amount > 0) {
        const debtorId = split.memberId;
        if (debtMatrix[debtorId] && debtMatrix[debtorId][payerId] !== undefined) {
          debtMatrix[debtorId][payerId] += Number(split.amount);
        }
      }
    });
  });

  // 2. Subtract settlements
  settlements.forEach(s => {
    const fromId = s.from;
    const toId = s.to;
    const amount = Number(s.amount) || 0;

    if (debtMatrix[fromId] && debtMatrix[fromId][toId] !== undefined) {
      debtMatrix[fromId][toId] -= amount;
    }
  });

  // 3. Net out mutual pairwise debts (e.g. A owes B $20 and B owes A $5 => A owes B $15)
  const rawDebts = [];
  const memberIds = members.map(m => m.id);

  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const idA = memberIds[i];
      const idB = memberIds[j];

      const aOwesB = debtMatrix[idA][idB] || 0;
      const bOwesA = debtMatrix[idB][idA] || 0;

      const net = Math.round((aOwesB - bOwesA) * 100) / 100;

      if (net > 0.01) {
        rawDebts.push({ from: idA, to: idB, amount: net });
      } else if (net < -0.01) {
        rawDebts.push({ from: idB, to: idA, amount: Math.abs(net) });
      }
    }
  }

  return rawDebts;
}

/**
 * Calculates minimal simplified transactions using Greedy Minimum Cash Flow algorithm.
 * Input: netBalances map { [memberId]: balance }
 * Returns: Array of { from: debtorId, to: creditorId, amount: number }
 */
export function calculateSimplifiedDebts(members, netBalances) {
  // Create working copies of non-zero balance records
  const debtors = [];
  const creditors = [];

  members.forEach(member => {
    const bal = netBalances[member.id] || 0;
    if (bal < -0.01) {
      debtors.push({ id: member.id, amount: Math.abs(bal) });
    } else if (bal > 0.01) {
      creditors.push({ id: member.id, amount: bal });
    }
  });

  // Sort debtors by largest debt first, creditors by largest credit first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts = [];
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(settleAmount * 100) / 100;

    if (roundedAmount > 0) {
      simplifiedDebts.push({
        from: debtor.id,
        to: creditor.id,
        amount: roundedAmount
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) {
      debtorIdx++;
    }
    if (creditor.amount < 0.01) {
      creditorIdx++;
    }
  }

  return simplifiedDebts;
}

/**
 * Returns comparison stats between raw and simplified transaction graphs.
 */
export function getSimplificationStats(rawDebts, simplifiedDebts) {
  const rawCount = rawDebts.length;
  const simplifiedCount = simplifiedDebts.length;
  const savedTransactions = Math.max(0, rawCount - simplifiedCount);
  const reductionPercentage = rawCount > 0 ? Math.round((savedTransactions / rawCount) * 100) : 0;

  return {
    rawCount,
    simplifiedCount,
    savedTransactions,
    reductionPercentage
  };
}
