export const StatusEnum = {
  active: 1,
  block: 2,
};

export const ChecklistEnum = {
  user: 1,
};
// Application
export const RoleEnum = {
  super: 1,
  admin: 2,
  user: 3,
  debugger: 4,
};
export const PermissionEnum = {
  dashboard: { name: "dashboard", sub: {} },
  settings: {
    name: "settings",
    sub: {},
  },
  logs: { id: 1, name: "logs", sub: {} },
  reports: { id: 2, name: "reports", sub: {} },
  configurations: {
    id: 3,
    name: "configurations",
    sub: {
      configurations_job: 31,
      configurations_checklist: 32,
    },
  },
  users: {
    id: 4,
    name: "users",
    sub: {
      user_information: 1,
      user_password: 2,
      user_permission: 3,
    },
  },
  audit: { id: 5, name: "audit", sub: {} },
  about: {
    id: 6,
    name: "about",
    sub: {
      director: 91,
      manager: 92,
      office: 93,
      technical_sup: 94,
    },
  },
  approval: {
    id: 7,
    name: "approval",
    sub: {
      user: 51,
    },
  },
  activity: {
    id: 8,
    name: "activity",
    sub: {
      user_activity: 71,
      password_activity: 72,
    },
  },
};
