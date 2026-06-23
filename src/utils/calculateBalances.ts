import type { Expense, Balance } from '@/types';

export function calculateGroupBalances(
  expenses: Expense[],
  groupId: string,
  groupName: string,
  currency: string,
  members: { id: string; displayName: string }[],
): Balance[] {
  const balanceMap = new Map<string, Balance>();

  for (const member of members) {
    balanceMap.set(member.id, {
      userId: member.id,
      displayName: member.displayName,
      groupId,
      groupName,
      netBalance: 0,
      currency,
    });
  }

  for (const expense of expenses) {
    const payer = balanceMap.get(expense.paidBy);
    if (payer) {
      payer.netBalance += expense.amount;
    }

    for (const split of expense.splitDetails) {
      const debtor = balanceMap.get(split.userId);
      if (debtor) {
        debtor.netBalance -= split.share;
      }
    }
  }

  return Array.from(balanceMap.values());
}

export function getNonZeroBalances(balances: Balance[]): Balance[] {
  return balances.filter((b) => Math.abs(b.netBalance) > 0.01);
}

export interface SettlementSuggestion {
  from: { userId: string; displayName: string };
  to: { userId: string; displayName: string };
  amount: number;
}

export function getSettlementSuggestions(
  balances: Balance[],
): SettlementSuggestion[] {
  const suggestions: SettlementSuggestion[] = [];

  const creditors = balances
    .filter((b) => b.netBalance > 0.01)
    .sort((a, b) => b.netBalance - a.netBalance)
    .map((b) => ({ ...b }));

  const debtors = balances
    .filter((b) => b.netBalance < -0.01)
    .sort((a, b) => a.netBalance - b.netBalance)
    .map((b) => ({ ...b }));

  for (const debtor of debtors) {
    let owed = Math.abs(debtor.netBalance);

    for (const creditor of creditors) {
      if (owed < 0.01 || creditor.netBalance < 0.01) continue;

      const amount = Math.min(owed, creditor.netBalance);

      suggestions.push({
        from: { userId: debtor.userId, displayName: debtor.displayName },
        to: { userId: creditor.userId, displayName: creditor.displayName },
        amount: Math.round(amount * 100) / 100,
      });

      creditor.netBalance -= amount;
      owed -= amount;
    }
  }

  return suggestions;
}
