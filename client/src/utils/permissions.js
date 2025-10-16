// Define all possible permissions in the system
export const Permissions = {
  // Loan Management
  VIEW_LOANS: 'view_loans',
  APPROVE_LOANS: 'approve_loans',
  REJECT_LOANS: 'reject_loans',
  UPDATE_LOAN_STATUS: 'update_loan_status',
  VIEW_LOAN_DOCUMENTS: 'view_loan_documents',
  
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  SUSPEND_USERS: 'suspend_users',
  
  // Payment Management
  VIEW_PAYMENTS: 'view_payments',
  PROCESS_DISBURSEMENT: 'process_disbursement',
  VIEW_PAYMENT_HISTORY: 'view_payment_history',
  
  // Analytics & Reports
  VIEW_ANALYTICS: 'view_analytics',
  GENERATE_REPORTS: 'generate_reports',
  
  // System Settings
  MANAGE_SETTINGS: 'manage_settings',
};

// Define role-based permission mappings
export const RolePermissions = {
  admin: [
    ...Object.values(Permissions)
  ],
  manager: [
    Permissions.VIEW_LOANS,
    Permissions.APPROVE_LOANS,
    Permissions.REJECT_LOANS,
    Permissions.UPDATE_LOAN_STATUS,
    Permissions.VIEW_LOAN_DOCUMENTS,
    Permissions.VIEW_USERS,
    Permissions.VIEW_PAYMENTS,
    Permissions.VIEW_ANALYTICS,
    Permissions.GENERATE_REPORTS,
  ],
  user: [
    Permissions.VIEW_LOANS, // Only their own loans
  ],
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  return RolePermissions[role]?.includes(permission) || false;
};

// Helper function to get all permissions for a role
export const getRolePermissions = (role) => {
  return RolePermissions[role] || [];
};