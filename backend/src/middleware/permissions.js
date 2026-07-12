// Define permissions mapping
const ROLE_PERMISSIONS = {
  'Admin': ['*'],
  'Fleet Manager': [
    'read:vehicles', 'write:vehicles',
    'read:drivers', 'write:drivers',
    'read:trips', 'write:trips',
    'read:maintenance', 'write:maintenance',
    'read:fuel', 'read:expenses',
    'read:dashboard', 'read:reports'
  ],
  'Driver': [
    'read:trips', 'update_status:trips',
    'read:vehicles', 'read:maintenance'
  ],
  'Safety Officer': [
    'read:vehicles', 'read:drivers',
    'read:trips', 'read:maintenance',
    'write:maintenance', 'read:reports'
  ],
  'Financial Analyst': [
    'read:vehicles', 'read:trips',
    'read:maintenance', 'read:fuel',
    'read:expenses', 'write:expenses',
    'read:dashboard', 'read:reports', 'read:analytics'
  ]
};

const hasPermission = (userRole, requiredPermission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(requiredPermission);
};

module.exports = {
  ROLE_PERMISSIONS,
  hasPermission
};
