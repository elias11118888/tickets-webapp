async function handler({ verificationCode }) {
  const DEFAULT_ADMIN_EMAIL = "admin@eventtix.com";
  const session = getSession();

  if (!session?.user?.email || session.user.email !== DEFAULT_ADMIN_EMAIL) {
    return { error: "Unauthorized access" };
  }

  try {
    const result = await sql.transaction(async (sql) => {
      // Verify the code
      const [storedCode] = await sql`
        SELECT token, expires 
        FROM auth_verification_token 
        WHERE identifier = ${session.user.email}
        AND token = ${verificationCode}
        AND expires > NOW()
      `;

      if (!storedCode) {
        return { error: "Invalid or expired verification code" };
      }

      // Delete used verification code
      await sql`
        DELETE FROM auth_verification_token 
        WHERE identifier = ${session.user.email}
        AND token = ${verificationCode}
      `;

      // Check if user already has super_admin role
      const existingRole = await sql`
        SELECT id FROM user_roles 
        WHERE user_id = ${session.user.id} 
        AND role_type = 'super_admin'
      `;

      if (existingRole.length > 0) {
        return { error: "Super admin already exists" };
      }

      // Create super admin role
      const permissions = [
        "manage_events",
        "manage_users",
        "manage_categories",
        "view_analytics",
        "manage_admins",
        "manage_roles",
        "manage_settings",
      ];

      const [role] = await sql`
        INSERT INTO user_roles (
          user_id,
          role_type,
          permissions,
          created_by_admin,
          approved_by,
          is_active
        )
        VALUES (
          ${session.user.id},
          'super_admin',
          ${permissions},
          ${session.user.id},
          ${session.user.id},
          true
        )
        RETURNING id
      `;

      // Log the activity
      await sql`
        INSERT INTO admin_activity_log (
          admin_id,
          action_type,
          target_type,
          target_id,
          description,
          metadata
        )
        VALUES (
          ${session.user.id},
          'create_role',
          'user_role',
          ${role.id},
          'Initial super admin role created',
          ${JSON.stringify({ role_type: "super_admin", permissions })}
        )
      `;

      return { success: true, roleId: role.id };
    });

    return result;
  } catch (error) {
    console.error("Error setting up super admin:", error);
    return { error: "Failed to setup super admin" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}