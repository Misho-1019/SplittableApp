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

/**
 * Computes TRUE per-pair balances for a specific user, using only expenses
 * where the user actually participated (as payer or in splitDetails).
 *
 * Unlike the old approach which computed group-level net balances and then
 * misinterpreted them as pairwise debts, this function directly accumulates
 * who owes whom by iterating each expense's splitDetails.
 *
 * For each expense:
 *   - If user is payer: each split member (except user) owes user their share
 *   - If someone else is payer and user is in splits: user owes payer their share
 *
 * Then completed settlements between the user and each other person are applied.
 */
export function getUserInvolvedBalances(
  expenses: Expense[],
  groupId: string,
  groupName: string,
  currency: string,
  members: { id: string; displayName: string }[],
  currentUserId: string,
  settlements?: Settlement[],
): BalanceFromPerspective[] {
  const memberMap = new Map(members.map((m) => [m.id, m.displayName]));
  const pairBalances = new Map<string, number>();

  for (const exp of expenses) {
    const userIsPayer = exp.paidBy === currentUserId;
    const userInSplit = exp.splitDetails.some((s) => s.userId === currentUserId);

    if (!userIsPayer && !userInSplit) continue;

    if (userIsPayer) {
      for (const split of exp.splitDetails) {
        if (split.userId === currentUserId) continue;
        pairBalances.set(
          split.userId,
          Math.round(((pairBalances.get(split.userId) ?? 0) + split.share) * 100) / 100,
        );
      }
    } else if (userInSplit) {
      const userShare = exp.splitDetails.find((s) => s.userId === currentUserId)?.share ?? 0;
      if (exp.paidBy !== currentUserId) {
        pairBalances.set(
          exp.paidBy,
          Math.round(((pairBalances.get(exp.paidBy) ?? 0) - userShare) * 100) / 100,
        );
      }
    }
  }

  if (settlements) {
    for (const s of settlements) {
      if (s.status !== 'completed') continue;
      if (s.fromUserId !== currentUserId && s.toUserId !== currentUserId) continue;

      if (s.toUserId === currentUserId) {
        pairBalances.set(
          s.fromUserId,
          Math.round(((pairBalances.get(s.fromUserId) ?? 0) - s.amount) * 100) / 100,
        );
      }
      if (s.fromUserId === currentUserId) {
        pairBalances.set(
          s.toUserId,
          Math.round(((pairBalances.get(s.toUserId) ?? 0) + s.amount) * 100) / 100,
        );
      }
    }
  }

  return Array.from(pairBalances.entries())
    .filter(([_, amount]) => Math.abs(amount) > 0.01)
    .map(([userId, amount]) => ({
      userId,
      displayName: memberMap.get(userId) ?? userId,
      groupId,
      groupName,
      currency,
      direction: (amount > 0 ? 'receive' : 'pay') as BalanceDirection,
      amount: Math.round(Math.abs(amount) * 100) / 100,
    }));
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
 * DEPRECATED — use getUserInvolvedBalances instead.
 *
 * Converts raw Balance objects into a perspective-aware list for the given user.
 *
 * WARNING: This function takes GROUP-level net balances and interprets them
 * as PAIRWISE debts. For groups with 3+ members, this produces incorrect
 * results — a person's group-level netBalance includes debts from all other
 * members, not just the current user.
 *
 * - direction === 'receive'  →  The OTHER person owes the current user money.
 * - direction === 'pay'      →  The current user owes the OTHER person money.
 * - `amount` is always a positive absolute value.
 */
export function getBalancesFromPerspective(
  balances: Balance[],
  currentUserId: string,
  expenses?: Expense[],
): BalanceFromPerspective[] {
  const involvedGroups = expenses
    ? new Set(
        expenses
          .filter(
            (e) =>
              e.paidBy === currentUserId ||
              e.splitDetails.some((s) => s.userId === currentUserId),
          )
          .map((e) => e.groupId),
      )
    : null;

  return balances
    .filter(
      (b) =>
        b.userId !== currentUserId &&
        Math.abs(b.netBalance) > 0.01 &&
        (!involvedGroups || involvedGroups.has(b.groupId)),
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
