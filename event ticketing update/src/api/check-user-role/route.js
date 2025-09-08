async function handler() {
  const session = getSession();

  if (!session?.user?.id) {
    return { isSuperAdmin: false };
  }

  const userId = session.user.id;

  const roles = await sql`
    SELECT role_type, is_active 
    FROM user_roles 
    WHERE user_id = ${userId} 
    AND role_type = 'super_admin' 
    AND is_active = true
  `;

  const isSuperAdmin = roles.length > 0;

  return { isSuperAdmin };
}
export async function POST(request) {
  return handler(await request.json());
}