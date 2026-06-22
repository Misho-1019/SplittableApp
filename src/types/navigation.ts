export type AuthRouteParams = {
  login: undefined;
  register: undefined;
};

export type GroupsRouteParams = {
  index: undefined;
  add: undefined;
  '[groupId]': { groupId: string };
  '[groupId]/members': { groupId: string };
  '[groupId]/add-expense': { groupId: string };
  '[groupId]/expenses/[expenseId]': { groupId: string; expenseId: string };
  '[groupId]/settle': {
    groupId: string;
    toUserId: string;
    toUserName: string;
    amount: string;
    currency: string;
  };
  '[groupId]/payment': {
    settlementId: string;
    clientSecret: string;
    amount: string;
    toUserName: string;
  };
  '[groupId]/payment/confirmation': {
    success: string;
    amount: string;
    toUserName: string;
  };
};

export type BalancesRouteParams = {
  index: undefined;
  settle: {
    groupId: string;
    toUserId: string;
    toUserName: string;
    amount: string;
    currency: string;
  };
  'payment/index': {
    settlementId: string;
    clientSecret: string;
    amount: string;
    toUserName: string;
  };
  'payment/confirmation': {
    success: string;
    amount: string;
    toUserName: string;
  };
};

export type SettingsRouteParams = {
  index: undefined;
};

export type TabRouteParams = {
  groups: undefined;
  balances: undefined;
  settings: undefined;
};
