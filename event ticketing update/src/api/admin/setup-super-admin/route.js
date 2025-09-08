async function handler() {
  const session = getSession();

  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Unauthorized access" };
  }

  if (session.user.email !== "admin@eventtix.com") {
    return { error: "Invalid admin email" };
  }

  try {
    const result = await sql.transaction(async (sql) => {
      // Check if user already has super_admin role
      const existingRole = await sql`
        SELECT id FROM user_roles 
        WHERE user_id = ${session.user.id} 
        AND role_type = 'super_admin'
      `;

      if (existingRole.length > 0) {
        return { error: "Super admin role already exists for this user" };
      }

      // Create super_admin role
      const [newRole] = await sql`
        INSERT INTO user_roles (
          user_id,
          role_type,
          permissions,
          created_at,
          is_active,
          created_by_admin
        )
        VALUES (
          ${session.user.id},
          'super_admin',
          ARRAY['all'],
          CURRENT_TIMESTAMP,
          true,
          ${session.user.id}
        )
        RETURNING id
      `;

      // Log the action
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
          'user_roles',
          ${newRole.id},
          'Initialized super admin role',
          ${JSON.stringify({
            role_type: "super_admin",
            user_email: session.user.email,
          })}
        )
      `;

      return { success: true, roleId: newRole.id };
    });

    return result;
  } catch (error) {
    console.error("Error setting up super admin:", error);
    return { error: "Failed to setup super admin role" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}