async function handler({ action, email, permissions, subAdminId }) {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }

  const userRole = await sql`
    SELECT role_type FROM user_roles 
    WHERE user_id = ${session.user.id} AND is_active = true
  `;

  if (!userRole.length || userRole[0].role_type !== "super_admin") {
    return { error: "Super admin access required" };
  }

  const superAdminId = session.user.id;

  if (action === "create") {
    if (!email || !permissions || !Array.isArray(permissions)) {
      return { error: "Email and permissions array required" };
    }

    const existingUser = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `;

    if (!existingUser.length) {
      return { error: "User not found with this email" };
    }

    const userId = existingUser[0].id;

    const existingRole = await sql`
      SELECT id FROM user_roles WHERE user_id = ${userId}
    `;

    if (existingRole.length) {
      return { error: "User already has a role assigned" };
    }

    const [newRole] = await sql.transaction([
      sql`
        INSERT INTO user_roles (user_id, role_type, permissions, created_by_admin, approved_by, is_active)
        VALUES (${userId}, 'sub_admin', ${permissions}, ${superAdminId}, ${superAdminId}, true)
        RETURNING id
      `,
      sql`
        INSERT INTO admin_activity_log (admin_id, action_type, target_type, target_id, description, metadata)
        VALUES (${superAdminId}, 'create_sub_admin', 'user_role', ${userId}, 'Created sub-admin role', ${JSON.stringify(
        { email, permissions }
      )})
      `,
    ]);

    return {
      success: true,
      message: "Sub-admin created successfully",
      roleId: newRole[0].id,
    };
  }

  if (action === "list") {
    const subAdmins = await sql`
      SELECT 
        ur.id,
        ur.user_id,
        au.name,
        au.email,
        ur.permissions,
        ur.is_active,
        ur.created_at,
        creator.name as created_by_name
      FROM user_roles ur
      JOIN auth_users au ON ur.user_id = au.id
      LEFT JOIN auth_users creator ON ur.created_by_admin = creator.id
      WHERE ur.role_type = 'sub_admin'
      ORDER BY ur.created_at DESC
    `;

    return { success: true, subAdmins };
  }

  if (action === "update") {
    if (!subAdminId || !permissions || !Array.isArray(permissions)) {
      return { error: "Sub-admin ID and permissions array required" };
    }

    const existingRole = await sql`
      SELECT user_id FROM user_roles 
      WHERE id = ${subAdminId} AND role_type = 'sub_admin'
    `;

    if (!existingRole.length) {
      return { error: "Sub-admin not found" };
    }

    await sql.transaction([
      sql`
        UPDATE user_roles 
        SET permissions = ${permissions}
        WHERE id = ${subAdminId}
      `,
      sql`
        INSERT INTO admin_activity_log (admin_id, action_type, target_type, target_id, description, metadata)
        VALUES (${superAdminId}, 'update_sub_admin', 'user_role', ${subAdminId}, 'Updated sub-admin permissions', ${JSON.stringify(
        { permissions }
      )})
      `,
    ]);

    return { success: true, message: "Sub-admin updated successfully" };
  }

  if (action === "deactivate") {
    if (!subAdminId) {
      return { error: "Sub-admin ID required" };
    }

    const existingRole = await sql`
      SELECT user_id FROM user_roles 
      WHERE id = ${subAdminId} AND role_type = 'sub_admin' AND is_active = true
    `;

    if (!existingRole.length) {
      return { error: "Active sub-admin not found" };
    }

    await sql.transaction([
      sql`
        UPDATE user_roles 
        SET is_active = false
        WHERE id = ${subAdminId}
      `,
      sql`
        INSERT INTO admin_activity_log (admin_id, action_type, target_type, target_id, description, metadata)
        VALUES (${superAdminId}, 'deactivate_sub_admin', 'user_role', ${subAdminId}, 'Deactivated sub-admin', ${JSON.stringify(
        { subAdminId }
      )})
      `,
    ]);

    return { success: true, message: "Sub-admin deactivated successfully" };
  }

  return { error: "Invalid action. Use: create, list, update, or deactivate" };
}
export async function POST(request) {
  return handler(await request.json());
}