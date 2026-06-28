import * as admin from 'firebase-admin';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

async function getUserPushTokens(userId: string): Promise<string[]> {
  const tokensSnap = await admin
    .firestore()
    .collection('users')
    .doc(userId)
    .collection('tokens')
    .get();

  return tokensSnap.docs.map((d) => d.data().token as string).filter(Boolean);
}

export async function sendPushToUser(userId: string, message: PushMessage): Promise<void> {
  const tokens = await getUserPushTokens(userId);
  if (tokens.length === 0) return;

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      tokens.map((token) => ({
        to: token,
        title: message.title,
        body: message.body,
        data: message.data ?? {},
        sound: 'default',
      })),
    ),
  });
}

export async function notifyExpenseInvolvedUsers(
  groupId: string,
  expenseId: string,
  expensePayerName: string,
  expenseDescription: string,
  expenseAmount: number,
): Promise<void> {
  const groupDoc = await admin.firestore().collection('groups').doc(groupId).get();
  if (!groupDoc.exists) return;
  const groupName = groupDoc.data()?.name ?? 'Group';

  const expenseDoc = await admin
    .firestore()
    .collection('groups')
    .doc(groupId)
    .collection('expenses')
    .doc(expenseId)
    .get();
  if (!expenseDoc.exists) return;

  const expenseData = expenseDoc.data()!;
  const splitUsers: string[] = (expenseData.splitDetails as Array<{ userId: string }>)
    ?.filter((s) => s.userId !== expenseData.paidBy)
    .map((s) => s.userId) ?? [];

  for (const userId of splitUsers) {
    await sendPushToUser(userId, {
      title: `New expense in ${groupName}`,
      body: `${expensePayerName} added $${expenseAmount.toFixed(2)} — ${expenseDescription}`,
      data: { screen: 'expense', groupId, expenseId },
    });
  }
}

export async function notifySettlementParty(
  targetUserId: string,
  groupId: string,
  fromUserName: string,
  amount: number,
  status: string,
): Promise<void> {
  const groupDoc = await admin.firestore().collection('groups').doc(groupId).get();
  const groupName = groupDoc.data()?.name ?? 'Group';

  await sendPushToUser(targetUserId, {
    title: `Settlement in ${groupName}`,
    body:
      status === 'completed'
        ? `${fromUserName} paid you $${amount.toFixed(2)}`
        : `${fromUserName} marked $${amount.toFixed(2)} as pending`,
    data: { screen: 'settlement', groupId },
  });
}

export async function notifyMemberAdded(
  newUserId: string,
  groupId: string,
  addedByName: string,
): Promise<void> {
  const groupDoc = await admin.firestore().collection('groups').doc(groupId).get();
  const groupName = groupDoc.data()?.name ?? 'Group';

  await sendPushToUser(newUserId, {
    title: `You were added to ${groupName}`,
    body: `${addedByName} added you to the group.`,
    data: { screen: 'group', groupId },
  });
}
