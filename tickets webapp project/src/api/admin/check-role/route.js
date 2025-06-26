async function handler() {
  const session = getSession();

  if (!session || !session.user?.id) {
    return { role: null, permissions: [], isAdmin: false };
  }

  const userId = session.user.id;

  const userRole = await sql`
    SELECT role_type, permissions, is_active 
    FROM user_roles 
    WHERE user_id = ${userId} 
    AND is_active = true 
    AND role_type IN ('super_admin', 'admin', 'sub_admin')
    ORDER BY 
      CASE role_type 
        WHEN 'super_admin' THEN 1 
        WHEN 'admin' THEN 2 
        WHEN 'sub_admin' THEN 3 
      END
    LIMIT 1
  `;

  if (userRole.length === 0) {
    return { role: null, permissions: [], isAdmin: false };
  }

  const role = userRole[0];

  return {
    role: role.role_type,
    permissions: role.permissions || [],
    isAdmin: true,
    userId: userId,
    userName: session.user.name,
    userEmail: session.user.email,
  };
}
export async function POST(request) {
  return handler(await request.json());
}