/**
 * Utility functions for team management and data access
 */

/**
 * Get the effective email for data queries
 * - For main admins: returns their own email
 * - For team members (invited admins): returns the main admin's email (invitedBy)
 * This ensures team members access the main admin's data
 */
export const getEffectiveUserEmail = (user) => {
  // If user is a team member (has invitedBy field), use the main admin's email
  if (user?.isAdmin && user?.invitedBy) {
    console.log(
      `🔄 Team member detected: ${user.email} -> using main admin: ${user.invitedBy}`
    );
    return user.invitedBy;
  }

  // Otherwise, use the user's own email
  console.log(`👤 Main admin or regular user: ${user?.email}`);
  return user?.email;
};

/**
 * Check if the current user is a team member (invited admin)
 */
export const isTeamMember = (user) => {
  return user?.isAdmin && user?.invitedBy;
};

/**
 * Check if the current user is the main admin (admin without invitedBy)
 */
export const isMainAdmin = (user) => {
  return user?.isAdmin && !user?.invitedBy;
};
