const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const supabase = require('../database/supabase');
const { hasPermission } = require('./permissions');

// Middleware to verify authentication via Clerk
const requireAuth = ClerkExpressRequireAuth({});

// Middleware to check roles
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // In a real app, you might cache this or store role in Clerk metadata
      const { data: user, error } = await supabase
        .from('users')
        .select('roles(name)')
        .eq('clerk_id', req.auth.userId)
        .single();

      if (error || !user) {
        return res.status(403).json({ error: 'Forbidden: User not found in database' });
      }

      const userRole = user.roles?.name;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      req.userRole = userRole;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error while checking roles' });
    }
  };
};

// Middleware to check specific permissions
const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      let userRole = req.userRole;
      if (!userRole) {
        const { data: user, error } = await supabase
          .from('users')
          .select('roles(name)')
          .eq('clerk_id', req.auth.userId)
          .single();

        if (error || !user) {
          return res.status(403).json({ error: 'Forbidden: User not found' });
        }
        userRole = user.roles?.name;
        req.userRole = userRole;
      }

      if (!hasPermission(userRole, requiredPermission)) {
        return res.status(403).json({ error: `Forbidden: Missing permission ${requiredPermission}` });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error while checking permissions' });
    }
  };
};

module.exports = {
  requireAuth,
  requireRole,
  requirePermission
};
