import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PermissionGateProps {
  permissions?: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions = [],
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { checkPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  const hasPermission = () => {
    if (!permissions) return true;
    if (typeof permissions === 'string') return checkPermission(permissions);
    return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  };

  return hasPermission() ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;