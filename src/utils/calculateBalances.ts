import type { Expense, Balance, Settlement } from '@/types';

/**
 * Calculates net balances for all members of a group.
 *
 * CONVENTION:
 *   netBalance > 0  →  This person paid MORE than their fair share.
 *                       They are a NET LENDER (creditor) — the group owes them.
 *   netBalance < 0  →  This person paid LESS than their fair share.
 *                       They are a NET BORROWER (debtor) — they owe the group.
 *
 * Example: Alice pays $100 for a dinner split equally with Bob.
 *   Alice = +50  (Alice overpaid by $50, Bob owes Alice $50)
 *   Bob   = -50  (Bob underpaid by $50, Bob owes Alice $50)
 *
 * To interpret a balance from another user's perspective, use
 * `getBalancesFromPerspective` or the per-pair settlement helpers.
 */
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

/**
 * Adjusts net balances to reflect completed settlements.
 *
 * When Alice pays Bob $X (a completed settlement):
 *   - Alice's netBalance INCREASES by X (she reduced her debt / paid what she owed)
 *   - Bob's netBalance DECREASES by X (he received payment / was paid what he was owed)
 *
 * Pending and failed settlements do not affect balances.
 */
export function applySettlementsToBalances(
  balances: Balance[],
  settlements: Settlement[],
): Balance[] {
  const result = balances.map((b) => ({ ...b }));

  for (const s of settlements) {
    if (s.status !== 'completed') continue;

    const from = result.find((b) => b.userId === s.fromUserId);
    const to = result.find((b) => b.userId === s.toUserId);

    if (from) {
      from.netBalance = Math.round((from.netBalance + s.amount) * 100) / 100;
    }
    if (to) {
      to.netBalance = Math.round((to.netBalance - s.amount) * 100) / 100;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Perspective-aware helpers
// ---------------------------------------------------------------------------

export type BalanceDirection = 'receive' | 'pay';

export interface BalanceFromPerspective {
  userId: string;
  displayName: string;
  groupId: string;
  groupName: string;
  currency: string;
  direction: BalanceDirection;
  amount: number;
}

/**
 * Converts raw Balance objects into a perspective-aware list for the given user.
 *
 * - direction === 'receive'  →  The OTHER person owes the current user money.
 * - direction === 'pay'      →  The current user owes the OTHER person money.
 * - `amount` is always a positive absolute value.
 *
 * This replaces manual sign-flipping (`-b.netBalance`) scattered across screens.
 */
export function getBalancesFromPerspective(
  balances: Balance[],
  currentUserId: string,
): BalanceFromPerspective[] {
  return balances
    .filter(
      (b) => b.userId !== currentUserId && Math.abs(b.netBalance) > 0.01,
    )
    .map((b) => {
      // If the other person's netBalance is NEGATIVE they underpaid →
      // the current user is OWED.  If POSITIVE the other overpaid →
      // the current user OWES them.
      const amount = Math.abs(b.netBalance);
      const direction: BalanceDirection =
        b.netBalance < 0 ? 'receive' : 'pay';

      return {
        userId: b.userId,
        displayName: b.displayName,
        groupId: b.groupId,
        groupName: b.groupName,
        currency: b.currency,
        direction,
        amount,
      };
    });
}

/**
 * Shortcut: balances where the current user should RECEIVE money.
 */
export function getOwedToUser(
  balances: Balance[],
  userId: string,
): BalanceFromPerspective[] {
  return getBalancesFromPerspective(balances, userId).filter(
    (b) => b.direction === 'receive',
  );
}

/**
 * Shortcut: balances where the current user should PAY money.
 */
export function getUserOwes(
  balances: Balance[],
  userId: string,
): BalanceFromPerspective[] {
  return getBalancesFromPerspective(balances, userId).filter(
    (b) => b.direction === 'pay',
  );
}

/**
 * Computes the user's overall net position across all groups.
 *
 *   netAggregate > 0  →  The user is owed money overall.
 *   netAggregate < 0  →  The user owes money overall.
 *
 * This is the user's OWN raw netBalance summed across groups, so it follows
 * the same convention as an individual Balance object.
 */
export function getOverallNetBalance(
  balances: Balance[],
  userId: string,
): number {
  return balances
    .filter((b) => b.userId === userId)
    .reduce((sum, b) => sum + b.netBalance, 0);
}

// ---------------------------------------------------------------------------
// Settlement suggestions
// ---------------------------------------------------------------------------

export interface SettlementSuggestion {
  from: { userId: string; displayName: string };
  to: { userId: string; displayName: string };
  amount: number;
}

/**
 * Greedy settlement matching: sorts net creditors descending and
 * net debtors ascending, then pairs them until all debts are matched.
 */
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
