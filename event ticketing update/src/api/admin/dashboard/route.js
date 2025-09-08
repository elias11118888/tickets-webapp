async function handler() {
  const session = getSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Authentication required",
    };
  }

  try {
    // Check if user has super_admin role
    const roleCheck = await sql`
      SELECT role_type 
      FROM user_roles 
      WHERE user_id = ${session.user.id} 
      AND role_type = 'super_admin' 
      AND is_active = true
    `;

    if (roleCheck.length === 0) {
      return {
        success: false,
        error: "Super admin access required",
      };
    }

    // Fetch all required data in a transaction
    const [eventCount, categoryCount, userCount, recentActivities] =
      await sql.transaction([
        sql`SELECT COUNT(*) as count FROM events`,
        sql`SELECT COUNT(*) as count FROM event_categories`,
        sql`SELECT COUNT(*) as count FROM auth_users`,
        sql`
        SELECT 
          aal.id,
          aal.action_type,
          aal.target_type,
          aal.description,
          aal.created_at,
          au.name as admin_name,
          au.email as admin_email
        FROM admin_activity_log aal
        LEFT JOIN auth_users au ON aal.admin_id = au.id
        ORDER BY aal.created_at DESC
        LIMIT 10
      `,
      ]);

    return {
      success: true,
      data: {
        totalEvents: eventCount[0].count,
        totalCategories: categoryCount[0].count,
        totalUsers: userCount[0].count,
        recentActivities: recentActivities,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard data",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}