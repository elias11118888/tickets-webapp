async function handler() {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  // Check if any super admin exists
  const existingSuperAdmin = await sql`
    SELECT id FROM user_roles 
    WHERE role_type = 'super_admin' 
    AND is_active = true
  `;

  if (existingSuperAdmin.length > 0) {
    return {
      initialized: false,
      message: "Super admin already exists",
    };
  }

  // Check if this is the first user
  const userCount = await sql`
    SELECT COUNT(*) as count FROM auth_users
  `;

  if (userCount[0].count > 1) {
    return {
      initialized: false,
      message: "Cannot initialize: not the first user",
    };
  }

  // Set up super admin role
  await sql.transaction([
    sql`
      INSERT INTO user_roles (
        user_id, 
        role_type, 
        permissions, 
        created_at, 
        is_active
      ) VALUES (
        ${session.user.id},
        'super_admin',
        ARRAY['all'],
        CURRENT_TIMESTAMP,
        true
      )
    `,
    sql`
      INSERT INTO admin_activity_log (
        admin_id,
        action_type,
        target_type,
        description,
        metadata
      ) VALUES (
        ${session.user.id},
        'super_admin_init',
        'user_roles',
        'Initialized first super admin',
        jsonb_build_object('user_id', ${session.user.id})
      )
    `,
  ]);

  return {
    initialized: true,
    message: "Successfully initialized super admin",
    userId: session.user.id,
  };
}
export async function POST(request) {
  return handler(await request.json());
}